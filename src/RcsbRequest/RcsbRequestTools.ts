import {
    DataCollectorArgsType,
    MultipleDocumentPropertyCollectorInterface
} from "../RcsbCollectTools/DataCollectors/DataCollectorInterface";
import {Assertions} from "../RcsbUtils/Helpers/Assertions";

export namespace RcsbRequestTools {

    import assertDefined = Assertions.assertDefined;

    export interface DataStatusInterface<T>{
        data:T|null;
        resolveList : Array<(x:T)=>void>;
        status:"pending"|"available";
    }

    export async function getSingleObjectData<T>(id:string, map: Map<string,DataStatusInterface<T>>, collector:()=>Promise<T>): Promise<T>{
        switch (map.get(id)?.status){
            case "available":
                const d = map.get(id)?.data;
                assertDefined(d);
                return d;
            case "pending":
                const x = map.get(id);
                assertDefined(x);
                return await mapResolve<T>(x)
            default:
                mapPending<T>(id, map);
                const t: T = await collector();
                const o = map.get(id);
                assertDefined(o);
                mapSet<T>(o,t)
                return t;
        }
    }

    export async function getMultipleObjectProperties<K extends string,T>(ids:string|Array<string>, map: Map<string,DataStatusInterface<T>>, collector:MultipleDocumentPropertyCollectorInterface<K,T>, collectorKey: K, propertyKey:(e:T)=>string): Promise<Array<T>>{
        if(!Array.isArray(ids))
            ids = [ids]
        const notAvailable: Array<string> = ids.filter(id=>map.get(id)?.status !== "available");
        if(notAvailable.length === 0){
            return ids.map(id=>{
                const d = map.get(id)?.data;
                assertDefined(d);
                return d;
            });
        }else{
            const available: Array<string> = ids.filter(id=>map.get(id)?.status === "available");
            const notPending: Array<string> = notAvailable.filter(id=>map.get(id)?.status !== "pending");
            if(notPending.length === 0 ){
                return Promise.all<T>([
                    ...available.map(id=>(new Promise<T>((resolve,reject) => {
                        const d = map.get(id)?.data;
                        assertDefined(d);
                        resolve(d);
                    }))),
                    ...notAvailable.map(id=>{
                        const o = map.get(id);
                        assertDefined(o);
                        return mapResolve<T>(o);
                    })
                ]);
            }else{
                const pending: Array<string> = notAvailable.filter(id=>map.get(id)?.status === "pending");
                const missing: Array<string> = notPending;
                missing.forEach(id=>{
                    mapPending<T>(id,map);
                });
                const properties: Array<T> = await collector.collect({[collectorKey]:missing} as DataCollectorArgsType<K>);
                properties.forEach(e=>{
                    const o = map.get(propertyKey(e));
                    assertDefined(o);
                    mapSet<T>(o,e);
                });
                return Promise.all<T>([
                    ...available.map(id=>(new Promise<T>((resolve,reject) => {
                        const d = map.get(id)?.data;
                        assertDefined(d);
                        resolve(d);
                    }))),
                    ...pending.map(id=>{
                        const o = map.get(id);
                        assertDefined(o);
                        return mapResolve<T>(o);
                    }),
                    ...properties.map(p=>(new Promise<T>((resolve,reject)=>{
                        resolve(p);
                    })))
                ]);
            }
        }
    }

    export function mapPending<T>(key:string, map: Map<string,DataStatusInterface<T>>): void{
        map.set(key, {data:null, resolveList: new Array<(x:T)=>void>(), status: "pending"});
    }

    export function mapResolve<T>(mapItem: DataStatusInterface<T>): Promise<T>{
        return new Promise<T>((resolve, reject) => {
            mapItem.resolveList.push(resolve);
        });
    }

    export function mapSet<T>(mapItem: DataStatusInterface<T>, data:T) {
        mapItem.data = data;
        mapItem.status = "available";
        while (mapItem.resolveList.length > 0) {
            mapItem.resolveList.shift()?.(data);
        }
    }
}