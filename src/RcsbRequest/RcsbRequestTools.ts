import {
    DataCollectorArgsType,
    MultipleDocumentPropertyCollectorInterface
} from "../RcsbCollectTools/DataCollectors/DataCollectorInterface";
import {Assertions} from "../RcsbUtils/Helpers/Assertions";

export namespace RcsbRequestTools {

    import assertDefined = Assertions.assertDefined;

    export interface DataStatusInterface<T>{
        id:string;
        data?:T;
        resolveList : Array<(x:T)=>void>;
        status:"pending"|"available";
    }

    export async function getSingleObjectData<T>(id:string, map: Map<string,DataStatusInterface<T>>, collector:()=>Promise<T>): Promise<T>{
        const obj = map.get(id);
        switch (obj?.status){
            case "available":
                assertDefined(obj.data,`Corrupted data object in object id ${obj.id}`);
                return obj.data;
            case "pending":
                return await mapResolve<T>(obj)
            default:
                const po = mapPending<T>(id, map);
                const t: T = await collector();
                mapSet<T>(po,t)
                return t;
        }
    }

    export async function getMultipleObjectProperties<K extends string,T>(ids:string|Array<string>, map: Map<string,DataStatusInterface<T>>, collector:MultipleDocumentPropertyCollectorInterface<K,T>, collectorKey: K, propertyKey:(e:T)=>string): Promise<Array<T>>{
        if(!Array.isArray(ids))
            ids = [ids]
        const objList: DataStatusInterface<T>[] = ids.map(id=>map.get(id)).filter((o): o is DataStatusInterface<T> => o !== null);
        console.log(map);
        const notAvailable: DataStatusInterface<T>[] = objList.filter(o=>o.status !== "available");
        if(notAvailable.length === 0){
            return objList.map(o=>{
                assertDefined(o.data)
                return o.data;
            });
        }else{
            const available: DataStatusInterface<T>[] = objList.filter(o=>o.status === "available");
            const notPending: DataStatusInterface<T>[] = notAvailable.filter(o=>o.status !== "pending");
            if(notPending.length === 0 ){
                return Promise.all<T>([
                    ...available.map(o=>(new Promise<T>((resolve,reject) => {
                        if(!o.data)
                            reject(`Corrupted data object in object id ${o.id}`);
                        else
                            resolve(o.data);
                    }))),
                    ...notAvailable.map(o=>(mapResolve<T>(o)))
                ]);
            }else{
                const pending: DataStatusInterface<T>[] = notAvailable.filter(o=>o.status === "pending");
                const missing: DataStatusInterface<T>[] = notPending;
                missing.forEach(o=>{
                    mapPending<T>(o.id,map);
                });
                const properties: Array<T> = await collector.collect({[collectorKey]:missing.map(o=>o.id)} as DataCollectorArgsType<K>);
                properties.forEach(e=>{
                    const o = map.get(propertyKey(e));
                    assertDefined(o,`Map object error`)
                    mapSet<T>(o,e);
                });
                return Promise.all<T>([
                    ...available.map(o=>(new Promise<T>((resolve,reject) => {
                        if(!o.data)
                            reject(`Corrupted data object in object id ${o.id}`);
                        else
                            resolve(o.data);
                    }))),
                    ...pending.map(o=>(mapResolve<T>(o))),
                    ...properties.map(p=>(new Promise<T>((resolve,reject)=>{
                        resolve(p);
                    })))
                ]);
            }
        }
    }

    export function mapPending<T>(key:string, map: Map<string,DataStatusInterface<T>>): DataStatusInterface<T>{
        const obj: DataStatusInterface<T> =  {data:undefined, resolveList: new Array<(x:T)=>void>(), status: "pending", id: key};
        map.set(key, obj);
        return obj;
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