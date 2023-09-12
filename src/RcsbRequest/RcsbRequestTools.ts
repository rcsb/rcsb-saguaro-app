import {
    DataCollectorArgsType,
    MultipleDocumentPropertyCollectorInterface
} from "../RcsbCollectTools/DataCollectors/DataCollectorInterface";

export namespace RcsbRequestTools {

    export async function getSingleObjectData<T>(id:string, map: Map<string,Promise<T>>, collector:()=>Promise<T>): Promise<T>{
        const promise = map.get(id);
        if(promise)
            return promise;
        const t: Promise<T> = collector();
        map.set(id,t)
        return t;
    }

    export async function getMultipleObjectProperties<K extends string,T>(
        ids: string|Array<string>,
        map: Map<string,Promise<T>>,
        collector:MultipleDocumentPropertyCollectorInterface<K,T>,
        collectorKey: K,
        propertyKey:(e:T)=>string
    ): Promise<Array<T>>{
        if(!Array.isArray(ids))
            ids = [ids];
        const missing = ids.filter(id=>!map.has(id));
        const collectorPromise = collector.collect({[collectorKey]:missing} as DataCollectorArgsType<K>);
        missing.forEach(id=>{
            map.set(
                id,
                new Promise((resolve, reject) => {
                    collectorPromise.then(t=>{
                        const d = t.find(t=>propertyKey(t)==id);
                        if(d)
                            resolve(d);
                        else
                            reject(`${id} not available`);
                    })
                })
            )
        });
        return Promise.all(ids.map(i=>map.get(i)).filter((x): x is Promise<T> => typeof x !== undefined));
    }

}