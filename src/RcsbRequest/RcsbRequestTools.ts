import {
    DataCollectorArgsType,
    MultipleDocumentPropertyCollectorInterface
} from "../RcsbCollectTools/DataCollectors/DataCollectorInterface";

export namespace RcsbRequestTools {

    export interface DataStatusInterface<T>{
        data:T;
        resolveList : Array<(x:T)=>void>;
        status:"pending"|"available";
    }

    export async function getSingleObjectData<T>(id:string, map: Map<string,DataStatusInterface<T>>, collector:()=>Promise<T>): Promise<T>{
        switch (map.get(id)?.status){
            case "available":
                return map.get(id).data;
            case "pending":
                return await mapResolve<T>(map.get(id))
            default:
                mapPending<T>(id, map);
                const t: T = await collector();
                mapSet<T>(map.get(id),t)
                return t;
        }
    }

    export async function getMultipleObjectProperties<K extends string,T>(
        ids:string|Array<string>,
        map: Map<string,DataStatusInterface<T>>,
        collector:MultipleDocumentPropertyCollectorInterface<K,T>,
        collectorKey: K, propertyKey:(e:T)=>string
    ): Promise<Array<T>>{
        if(!Array.isArray(ids))
            ids = [ids]
        const notAvailable: Array<string> = ids.filter(id=>map.get(id)?.status !== "available");
        if(notAvailable.length === 0){
            return ids.map(id=>map.get(id).data);
        }else{
            const available: Array<string> = ids.filter(id=>map.get(id)?.status === "available");
            const notPending: Array<string> = notAvailable.filter(id=>map.get(id)?.status !== "pending");
            if(notPending.length === 0 ){
                return Promise.all<T>([
                    ...available.map(id=>(new Promise<T>((resolve,reject) => {
                        resolve(map.get(id).data);
                    }))),
                    ...notAvailable.map(id=>(mapResolve<T>(map.get(id))))
                ]);
            }else{
                const pending: Array<string> = notAvailable.filter(id=>map.get(id)?.status === "pending");
                const missing: Array<string> = notPending;
                missing.forEach(id=>{
                    mapPending<T>(id,map);
                });
                const properties: Array<T> = await collector.collect({[collectorKey]:missing} as DataCollectorArgsType<K>);
                properties.forEach(e=>{
                    mapSet<T>(map.get(propertyKey(e)),e);
                });
                return Promise.all<T>([
                    ...available.map(id=>(new Promise<T>((resolve,reject) => {
                        resolve(map.get(id).data);
                    }))),
                    ...pending.map(id=>(mapResolve<T>(map.get(id)))),
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
        if(mapItem.data!=null) {
            console.warn('Cache data overwrite | This action is not allowed');
        }
        mapItem.data = data;
        mapItem.status = "available";
        while (mapItem.resolveList.length > 0) {
            mapItem.resolveList.shift()(data);
        }
    }
}