import {RcsbFv, RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/PolymerEntityInstanceTranslate";
import {PolymerEntityInstancesCollector} from "../../RcsbCollectTools/Translators/PolymerEntityInstancesCollector";
import {EntryAssemblyTranslate} from "../../RcsbUtils/EntryAssemblyTranslate";
import {EntryAssembliesCollector} from "../../RcsbCollectTools/Translators/EntryAssembliesCollector";
import {PolymerEntityChromosomeTranslate} from "../../RcsbUtils/PolymerEntityChromosomeTranslate";
import {PolymerEntityChromosomeCollector} from "../../RcsbCollectTools/Translators/PolymerEntityChromosomeCollector";
import {InterfaceInstanceTranslate} from "../../RcsbUtils/InterfaceInstanceTranslate";
import {InterfaceInstanceCollector} from "../../RcsbCollectTools/Translators/InterfaceInstanceCollector";
import {CoreAssembly} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {AssemblyInterfacesCollector} from "../../RcsbCollectTools/Translators/AssemblyInterfacesCollector";
import {TagDelimiter} from "../../RcsbUtils/TagDelimiter";
import {AssemblyInterfacesTranslate} from "../../RcsbUtils/AssemblyInterfacesTranslate";

interface DataStatusInterface<T>{
    data:T;
    resolveList : Array<(x:T)=>void>;
    status:"pending"|"available";
}

class RcsbFvContextManager {
    private rcsbFvManager: Map<string, RcsbFv> = new Map<string, RcsbFv>();
    private rcsbButtonManager: Map<string, Set<string>> = new Map<string, Set<string>>();
    private polymerEntityToInstanceMap: Map<string,DataStatusInterface<PolymerEntityInstanceTranslate>> = new Map<string, DataStatusInterface<PolymerEntityInstanceTranslate>>();
    private entryToAssemblyMap: Map<string,DataStatusInterface<EntryAssemblyTranslate>> = new Map<string, DataStatusInterface<EntryAssemblyTranslate>>();
    private interfaceToInstanceMap: Map<string,DataStatusInterface<InterfaceInstanceTranslate>> = new Map<string, DataStatusInterface<InterfaceInstanceTranslate>>();
    private assemblyInterfacesMap: Map<string,DataStatusInterface<AssemblyInterfacesTranslate>> = new Map<string, DataStatusInterface<AssemblyInterfacesTranslate>>();

    public getFv(elementFvId: string, boardConfig?: Partial<RcsbFvBoardConfigInterface>): RcsbFv{
        if( this.rcsbFvManager.has(elementFvId)) {
            return this.rcsbFvManager.get(elementFvId);
        }else{
            const rcsbFvSingleViewer: RcsbFv = buildRcsbFvSingleViewer(elementFvId, boardConfig);
            rcsbFvCtxManager.setFv(elementFvId, rcsbFvSingleViewer);
            return rcsbFvSingleViewer;
        }
    }

    public hasFv(elementFvId: string): boolean{
        return this.rcsbFvManager.has(elementFvId);
    }

    private setFv(elementFvId: string, rcsbFv: RcsbFv): void{
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

    private setEntityToInstance(entryId: string, map: PolymerEntityInstanceTranslate): void{
        mapSet<PolymerEntityInstanceTranslate>(this.polymerEntityToInstanceMap.get(entryId), map);
    }

    private setEntryToAssembly(entryId: string, map: EntryAssemblyTranslate): void{
        mapSet<EntryAssemblyTranslate>(this.entryToAssemblyMap.get(entryId), map);
    }

    public async getEntityToInstance(entryId: string): Promise<PolymerEntityInstanceTranslate>{
        const key: string = entryId.toUpperCase();
        if(this.polymerEntityToInstanceMap.get(key)?.status === "available") {
            return this.polymerEntityToInstanceMap.get(key).data;
        } else if (this.polymerEntityToInstanceMap.get(key)?.status === "pending") {
            return await mapResolve<PolymerEntityInstanceTranslate>(this.polymerEntityToInstanceMap.get(key));
        }else{
            mapPending<PolymerEntityInstanceTranslate>(key, this.polymerEntityToInstanceMap);
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
            return await mapResolve<EntryAssemblyTranslate>(this.entryToAssemblyMap.get(key));
        }else{
            mapPending<EntryAssemblyTranslate>(key, this.entryToAssemblyMap);
            mapPending<PolymerEntityInstanceTranslate>(key, this.polymerEntityToInstanceMap);
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

    public async getInterfaceToInstance(interfaceId:string): Promise<InterfaceInstanceTranslate>{
        const key: string = interfaceId;
        const assemblyId = interfaceId.split(TagDelimiter.instance)[0];
        if(this.interfaceToInstanceMap.get(key)?.status === "available"){
            return this.interfaceToInstanceMap.get(key).data;
        } else if(this.interfaceToInstanceMap.get(key)?.status === "pending"){
            return await mapResolve<InterfaceInstanceTranslate>(this.interfaceToInstanceMap.get(key));
        }else if (this.assemblyInterfacesMap.get(assemblyId)?.status === "pending"){
            mapPending<InterfaceInstanceTranslate>(key, this.interfaceToInstanceMap);
            return await mapResolve<InterfaceInstanceTranslate>(this.interfaceToInstanceMap.get(key));
        }else{
            mapPending<InterfaceInstanceTranslate>(key, this.interfaceToInstanceMap);
            const assemblyInterfaces = await this.getAssemblyInterfaces(assemblyId);
            const interfaceCollector: InterfaceInstanceCollector = new InterfaceInstanceCollector();
            const result = await interfaceCollector.collect({interface_ids: assemblyInterfaces.getInterfaces(assemblyId)});
            const translator: InterfaceInstanceTranslate =  new InterfaceInstanceTranslate(result);
            for(const id of assemblyInterfaces.getInterfaces(assemblyId)){
                if(this.interfaceToInstanceMap.get(id)?.status === "pending")
                    mapSet<InterfaceInstanceTranslate>(this.interfaceToInstanceMap.get(id),translator);
                else
                    this.interfaceToInstanceMap.set(id,{
                        data: translator,
                        status: "available",
                        resolveList: []
                    });
            }
            return translator;
        }
    }

    private async getAssemblyInterfaces(assemblyId:string): Promise<AssemblyInterfacesTranslate> {
        const key: string = assemblyId;
        if(this.assemblyInterfacesMap.get(key)?.status === "available"){
            return this.assemblyInterfacesMap.get(key).data;
        }else if(this.assemblyInterfacesMap.get(key)?.status === "pending"){
            return await mapResolve<AssemblyInterfacesTranslate>(this.assemblyInterfacesMap.get(key));
        }else{
            mapPending<AssemblyInterfacesTranslate>(key, this.assemblyInterfacesMap);
            const assemblyInterfacesCollector: AssemblyInterfacesCollector = new AssemblyInterfacesCollector();
            const result = await assemblyInterfacesCollector.collect({assembly_ids:[assemblyId]});
            const translator: AssemblyInterfacesTranslate = new AssemblyInterfacesTranslate(result);
            mapSet<AssemblyInterfacesTranslate>(this.assemblyInterfacesMap.get(key), translator);
            return translator;
        }
    }

}

function buildRcsbFvSingleViewer(elementId: string, boardConfig?: Partial<RcsbFvBoardConfigInterface>): RcsbFv{
    const config: RcsbFvBoardConfigInterface =  {
        rowTitleWidth: 190,
        trackWidth: 900,
        ...boardConfig
    };
    return new RcsbFv({
        rowConfigData: null,
        boardConfigData: config,
        elementId: elementId
    });
}

function mapPending<T>(key:string, hashMap: Map<string,DataStatusInterface<T>>): void{
    hashMap.set(key, {data:null, resolveList: new Array<(x:T)=>void>(), status: "pending"});
}

function mapResolve<T>(map: DataStatusInterface<T>): Promise<T>{
    return new Promise<T>((resolve, reject) => {
        map.resolveList.push(resolve);
    });
}

function mapSet<T>(mapItem: DataStatusInterface<T>, map:T){
    mapItem.data = map;
    mapItem.status = "available";
    while (mapItem.resolveList.length > 0){
        mapItem.resolveList.shift()(map);
    }
}

export const rcsbFvCtxManager: RcsbFvContextManager = new RcsbFvContextManager();
