import {RcsbFv, RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {PolymerEntityInstancesCollector} from "../../RcsbCollectTools/Translators/PolymerEntityInstancesCollector";
import {EntryAssemblyTranslate} from "../../RcsbUtils/Translators/EntryAssemblyTranslate";
import {EntryAssembliesCollector} from "../../RcsbCollectTools/Translators/EntryAssembliesCollector";
import {PolymerEntityChromosomeTranslate} from "../../RcsbUtils/Translators/PolymerEntityChromosomeTranslate";
import {PolymerEntityChromosomeCollector} from "../../RcsbCollectTools/Translators/PolymerEntityChromosomeCollector";
import {GroupMemberCollector} from "../../RcsbCollectTools/Translators/GroupMemberCollector";
import {
    EntryPropertyIntreface,
    MultipleEntryPropertyCollector
} from "../../RcsbCollectTools/PropertyCollector/MultipleEntryPropertyCollector";
import {GroupPropertiesProvider} from "../../RcsbUtils/GroupPropertiesProvider";
import {Operator} from "../../Helpers/Operator";
import {QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {SearchQueryType, SearchRequestProperty} from "../../RcsbSeacrh/SearchRequestProperty";
import {
    GroupPropertyCollector,
    GroupPropertyInterface
} from "../../RcsbCollectTools/PropertyCollector/GroupPropertyCollector";
import {QueryPolymer_Entity_GroupArgs} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {FacetType} from "../../RcsbSeacrh/FacetStore/FacetMemberInterface";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {sha1} from "object-hash";
import {InterfaceInstanceTranslate} from "../../RcsbUtils/Translators/InterfaceInstanceTranslate";
import {InterfaceInstanceCollector} from "../../RcsbCollectTools/Translators/InterfaceInstanceCollector";
import {AssemblyInterfacesCollector} from "../../RcsbCollectTools/Translators/AssemblyInterfacesCollector";
import {TagDelimiter} from "../../RcsbUtils/TagDelimiter";
import {AssemblyInterfacesTranslate} from "../../RcsbUtils/Translators/AssemblyInterfacesTranslate";

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
    private searchRequestMap: Map<string,DataStatusInterface<QueryResult|null>> = new Map<string, DataStatusInterface<QueryResult|null>>();
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

    public async getGroupMemberProperties(groupQuery: QueryPolymer_Entity_GroupArgs): Promise<GroupPropertiesProvider>{
        const key: string = groupQuery.group_id.toUpperCase();
        if(this.groupPropertyMap.get(key)?.status === "available") {
            return this.groupPropertyMap.get(key).data;
        }else if(this.groupPropertyMap.get(key)?.status === "pending"){
            return await mapResolve<GroupPropertiesProvider>(this.groupPropertyMap.get(key));
        }else{
            mapPending<GroupPropertiesProvider>(key, this.groupPropertyMap);
            const groupMemberCollector: GroupMemberCollector = new GroupMemberCollector();
            const result = await groupMemberCollector.collect(groupQuery);
            const multipleEntryPropertyCollector: MultipleEntryPropertyCollector = new MultipleEntryPropertyCollector();
            const entriesProperties: Array<EntryPropertyIntreface> = await multipleEntryPropertyCollector.collect({entry_ids:Operator.uniqueValues(result.map(r=>r.entryId))})
            const propertiesProvider: GroupPropertiesProvider = new GroupPropertiesProvider({entryProperties: entriesProperties});
            this.setGroupProperties(groupQuery.group_id, propertiesProvider);
            return propertiesProvider;
        }
    }

    public async getSearchQueryResult(query: SearchQueryType, facets: FacetType[], returnType:ReturnType): Promise<QueryResult | null>{
        const key: string = sha1(query)+"."+sha1(facets);
        if(this.searchRequestMap.get(key)?.status === "available") {
            return this.searchRequestMap.get(key)?.data;
        }else if(this.searchRequestMap.get(key)?.status === "pending") {
            return await mapResolve<QueryResult|null>(this.searchRequestMap.get(key));
        }else{
            mapPending<QueryResult|null>(key,this.searchRequestMap);
            const collector: SearchRequestProperty = new SearchRequestProperty();
            const searchResult: QueryResult | null = await collector.request(query, facets, returnType);
            mapSet<QueryResult|null>(this.searchRequestMap.get(key), searchResult);
            return searchResult;
        }
    }

    public async getGroupProperties(groupQuery: QueryPolymer_Entity_GroupArgs): Promise<GroupPropertyInterface> {
        const groupPropertyCollector: GroupPropertyCollector = new GroupPropertyCollector();
        return await groupPropertyCollector.collect(groupQuery);
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
