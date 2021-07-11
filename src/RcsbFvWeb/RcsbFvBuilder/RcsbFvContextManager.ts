import {RcsbFv, RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/PolymerEntityInstanceTranslate";
import {PolymerEntityInstancesCollector} from "../../RcsbCollectTools/Translators/PolymerEntityInstancesCollector";
import {EntryAssemblyTranslate} from "../../RcsbUtils/EntryAssemblyTranslate";
import {EntryAssembliesCollector} from "../../RcsbCollectTools/Translators/EntryAssembliesCollector";
import {PolymerEntityChromosomeTranslate} from "../../RcsbUtils/PolymerEntityChromosomeTranslate";
import {PolymerEntityChromosomeCollector} from "../../RcsbCollectTools/Translators/PolymerEntityChromosomeCollector";
import {GroupMemberCollector} from "../../RcsbCollectTools/Translators/GroupMemberCollector";
import {
    EntryPropertyIntreface,
    MultipleEntryPropertyCollector
} from "../../RcsbCollectTools/PropertyCollector/MultipleEntryPropertyCollector";
import {GroupPropertiesProvider} from "../../RcsbUtils/GroupPropertiesProvider";
import {Operator} from "../../Helpers/Operator";
import {GroupKey} from "../../RcsbGraphQL/RcsbClient";
import {QueryResult} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchResultInterface";
import {SearchQueryType, SearchRequestProperty} from "../../RcsbSeacrh/SearchRequestProperty";
import {FacetStoreType} from "../../RcsbSeacrh/FacetStore/FacetStore";
import {
    GroupPropertyCollector,
    GroupPropertyInterface
} from "../../RcsbCollectTools/PropertyCollector/GroupPropertyCollector";

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
    private groupPropertyMap: Map<string,DataStatusInterface<GroupPropertiesProvider>> = new Map<string, DataStatusInterface<GroupPropertiesProvider>>();


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

    private setGroupProperties(groupId: string, map:GroupPropertiesProvider): void{
        mapSet<GroupPropertiesProvider>(this.groupPropertyMap.get(groupId), map);
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

    public async getGroupMemberProperties(groupKey: GroupKey, groupId: string): Promise<GroupPropertiesProvider>{
        const key: string = groupId.toUpperCase();
        if(this.groupPropertyMap.get(key)?.status === "available") {
            return this.groupPropertyMap.get(key).data;
        }else if(this.groupPropertyMap.get(key)?.status === "pending"){
            return await mapResolve<GroupPropertiesProvider>(this.groupPropertyMap.get(key));
        }else{
            mapPending<GroupPropertiesProvider>(key, this.groupPropertyMap);
            const groupMemberCollector: GroupMemberCollector = new GroupMemberCollector();
            const result = await groupMemberCollector.collect({groupId: groupId, groupKey: groupKey});
            const multipleEntryPropertyCollector: MultipleEntryPropertyCollector = new MultipleEntryPropertyCollector();
            const entriesProperties: Array<EntryPropertyIntreface> = await multipleEntryPropertyCollector.collect({entry_ids:Operator.uniqueValues(result.map(r=>r.entryId))})
            const propertiesProvider: GroupPropertiesProvider = new GroupPropertiesProvider({entryProperties: entriesProperties});
            this.setGroupProperties(groupId, propertiesProvider);
            return propertiesProvider;
        }
    }

    public async getSearchQueryResult(query: SearchQueryType, facetStoreType: FacetStoreType): Promise<QueryResult>{
        const collector: SearchRequestProperty = new SearchRequestProperty();
        return collector.request(query, facetStoreType);
    }

    public async getGroupProperties(groupKey: GroupKey, groupId: string): Promise<GroupPropertyInterface> {
        const groupPropertyCollector: GroupPropertyCollector = new GroupPropertyCollector();
        return await groupPropertyCollector.collect({
            groupId: groupId,
            groupKey: groupKey
        });
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
