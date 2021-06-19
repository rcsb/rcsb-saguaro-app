import {RcsbFv, RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {PolymerEntityInstancesCollector} from "../CollectTools/Translators/PolymerEntityInstancesCollector";
import {EntryAssemblyTranslate} from "../Utils/EntryAssemblyTranslate";
import {EntryAssembliesCollector} from "../CollectTools/Translators/EntryAssembliesCollector";
import {PolymerEntityChromosomeTranslate} from "../Utils/PolymerEntityChromosomeTranslate";
import {PolymerEntityChromosomeCollector} from "../CollectTools/Translators/PolymerEntityChromosomeCollector";

interface DataStatusInterface<T>{
    data:T;
    status:"pending"|"available";
}

class RcsbFvContextManager {
    private rcsbFvManager: Map<string, RcsbFv> = new Map<string, RcsbFv>();
    private rcsbButtonManager: Map<string, Set<string>> = new Map<string, Set<string>>();
    private boardConfig: RcsbFvBoardConfigInterface;
    private polymerEntityToInstanceMap: Map<string,DataStatusInterface<PolymerEntityInstanceTranslate>> = new Map<string, DataStatusInterface<PolymerEntityInstanceTranslate>>();
    private entryToAssemblyMap: Map<string,DataStatusInterface<EntryAssemblyTranslate>> = new Map<string, DataStatusInterface<EntryAssemblyTranslate>>();

    public getFv(elementFvId: string): RcsbFv{
        return this.rcsbFvManager.get(elementFvId);
    }

    public setFv(elementFvId: string, rcsbFv: RcsbFv): void{
        this.rcsbFvManager.set(elementFvId, rcsbFv);
    }

    public getButtonList(elementFvId: string): Set<string>{
        return this.rcsbButtonManager.get(elementFvId);
    }

    public setButton(elementFvId: string, buttonId: string): void{
        if(this.rcsbButtonManager.get(elementFvId) == null)
            this.rcsbButtonManager.set(elementFvId, new Set<string>());
        this.rcsbButtonManager.get(elementFvId).add(buttonId);
    }

    public removeFv(elementFvId: string): void{
        this.rcsbFvManager.delete(elementFvId);
        if(this.rcsbButtonManager.has(elementFvId))
            this.rcsbButtonManager.delete(elementFvId);
    }

    public getBoardConfig():RcsbFvBoardConfigInterface{
        return this.boardConfig;
    }

    private setEntityToInstance(entryId: string, map: PolymerEntityInstanceTranslate): void{
        this.polymerEntityToInstanceMap.set(entryId, {data:map, status: "available"});
    }

    private setEntryToAssembly(entryId: string, map: EntryAssemblyTranslate): void{
        this.entryToAssemblyMap.set(entryId, {data:map, status: "available"});
    }

    public async getEntityToInstance(entryId: string): Promise<PolymerEntityInstanceTranslate>{
        const key: string = entryId.toUpperCase();
        if(this.polymerEntityToInstanceMap.get(key)?.status === "available") {
            return this.polymerEntityToInstanceMap.get(key).data;
        } else if (this.polymerEntityToInstanceMap.get(key)?.status === "pending") {
            return await requestWait<PolymerEntityInstanceTranslate>(key, this.polymerEntityToInstanceMap);
        }else{
            requestPending(key, this.polymerEntityToInstanceMap);
            const instanceCollector: PolymerEntityInstancesCollector = new PolymerEntityInstancesCollector();
            const result = await instanceCollector.collect({entry_id: key});
            const translator: PolymerEntityInstanceTranslate =  new PolymerEntityInstanceTranslate(result);
            this.setEntityToInstance(key, translator);
            return translator;
        }
    }

    public async getEntryToAssembly(entryId: string): Promise<EntryAssemblyTranslate>{
        const key: string = entryId.toUpperCase();
        if(this.entryToAssemblyMap.get(key)?.status === "available") {
            return this.entryToAssemblyMap.get(key).data;
        } else if (this.entryToAssemblyMap.get(key)?.status === "pending") {
            return await requestWait<EntryAssemblyTranslate>(key, this.entryToAssemblyMap);
        }else{
            requestPending(key, this.entryToAssemblyMap);
            requestPending(key, this.polymerEntityToInstanceMap);
            const assemblyCollector: EntryAssembliesCollector = new EntryAssembliesCollector();
            const result = await assemblyCollector.collect({entry_id: key});
            const translator: EntryAssemblyTranslate =  new EntryAssemblyTranslate(result);
            this.setEntryToAssembly(key, translator);
            this.setEntityToInstance(key, new PolymerEntityInstanceTranslate(result.get(EntryAssembliesCollector.modelKey)));
            return translator;
        }
    }

    public async getEntityToChromosome( entityIds: Array<string> ): Promise<PolymerEntityChromosomeTranslate> {
        const entityChrCollector: PolymerEntityChromosomeCollector = new PolymerEntityChromosomeCollector();
        const chrMap = await entityChrCollector.collect(entityIds);
        return new PolymerEntityChromosomeTranslate(chrMap);
    }

}

function requestPending<T>(key:string, map: Map<string,DataStatusInterface<T>>): void{
    map.set(key, {data:null, status: "pending"});
}

function requestWait<T>(key:string, map: Map<string,DataStatusInterface<T>>): Promise<T>{
    return new Promise<T>((resolve, reject) => {
        const recursiveWait = () =>{
            if(map.get(key)?.status === "pending"){
                setTimeout(()=>{
                    recursiveWait();
                },100);
            }else{
                resolve(map.get(key).data);
            }
        };
        recursiveWait();
    });
}

export const rcsbFvCtxManager: RcsbFvContextManager = new RcsbFvContextManager();
