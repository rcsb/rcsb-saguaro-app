import {PolymerEntityInstanceTranslate} from "../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {EntryAssemblyTranslate} from "../RcsbUtils/Translators/EntryAssemblyTranslate";
import {GroupPropertiesProvider} from "../RcsbUtils/Groups/GroupPropertiesProvider";
import {QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {InterfaceInstanceTranslate} from "../RcsbUtils/Translators/InterfaceInstanceTranslate";
import {AssemblyInterfacesTranslate} from "../RcsbUtils/Translators/AssemblyInterfacesTranslate";
import {
    PolymerEntityInstanceInterface,
    PolymerEntityInstancesCollector
} from "../RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";
import {EntryAssembliesCollector} from "../RcsbCollectTools/DataCollectors/EntryAssembliesCollector";
import {PolymerEntityChromosomeTranslate} from "../RcsbUtils/Translators/PolymerEntityChromosomeTranslate";
import {PolymerEntityChromosomeCollector} from "../RcsbCollectTools/DataCollectors/PolymerEntityChromosomeCollector";
import {
    QueryPolymer_EntitiesArgs,
    QueryPolymer_Entity_GroupArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {GroupMemberCollector} from "../RcsbCollectTools/DataCollectors/GroupMemberCollector";
import {
    EntryPropertyIntreface,
    MultipleEntryPropertyCollector
} from "../RcsbCollectTools/DataCollectors/MultipleEntryPropertyCollector";
import {Operator} from "../Helpers/Operator";
import {SearchQueryType, SearchRequestProperty} from "../RcsbSeacrh/SearchRequestProperty";
import {FacetType} from "../RcsbSeacrh/FacetStore/FacetMemberInterface";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {sha1} from "object-hash";
import {
    GroupPropertyCollector,
    GroupPropertyInterface
} from "../RcsbCollectTools/DataCollectors/GroupPropertyCollector";
import {TagDelimiter} from "../RcsbUtils/TagDelimiter";
import {
    InterfaceInstanceCollector,
    InterfaceInstanceInterface
} from "../RcsbCollectTools/DataCollectors/InterfaceInstanceCollector";
import {
    AssemblyInterfacesCollector,
    AssemblyInterfacesInterface
} from "../RcsbCollectTools/DataCollectors/AssemblyInterfacesCollector";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {MultipleEntityInstancesCollector} from "../RcsbCollectTools/DataCollectors/MultipleEntityInstancesCollector";
import {CollectorArgsType, MultipleDocumentPropertyCollectorInterface} from "../RcsbCollectTools/DataCollectors/CollectorInterface";

interface DataStatusInterface<T>{
    data:T;
    resolveList : Array<(x:T)=>void>;
    status:"pending"|"available";
}

class RcsbRequestContextManager {

    private readonly polymerEntityToInstanceMap: Map<string,DataStatusInterface<PolymerEntityInstanceTranslate>> = new Map<string, DataStatusInterface<PolymerEntityInstanceTranslate>>();
    private readonly entryToAssemblyMap: Map<string,DataStatusInterface<EntryAssemblyTranslate>> = new Map<string, DataStatusInterface<EntryAssemblyTranslate>>();
    private readonly groupPropertyMap: Map<string,DataStatusInterface<GroupPropertiesProvider>> = new Map<string, DataStatusInterface<GroupPropertiesProvider>>();
    private readonly searchRequestMap: Map<string,DataStatusInterface<QueryResult|null>> = new Map<string, DataStatusInterface<QueryResult|null>>();
    private readonly interfaceToInstanceMap: Map<string,DataStatusInterface<InterfaceInstanceTranslate>> = new Map<string, DataStatusInterface<InterfaceInstanceTranslate>>();
    private readonly assemblyInterfacesMap: Map<string,DataStatusInterface<AssemblyInterfacesTranslate>> = new Map<string, DataStatusInterface<AssemblyInterfacesTranslate>>();

    private readonly entryPropertyMap: Map<string,DataStatusInterface<EntryPropertyIntreface>> = new Map<string, DataStatusInterface<EntryPropertyIntreface>>();
    private readonly entityPropertyMap: Map<string,DataStatusInterface<PolymerEntityInstanceInterface>> = new Map<string, DataStatusInterface<PolymerEntityInstanceInterface>>();

    private readonly searchRequest: SearchRequestProperty = new SearchRequestProperty();
    private readonly instanceCollector: PolymerEntityInstancesCollector = new PolymerEntityInstancesCollector();
    private readonly assemblyCollector: EntryAssembliesCollector = new EntryAssembliesCollector();
    private readonly entityChrCollector: PolymerEntityChromosomeCollector = new PolymerEntityChromosomeCollector();
    private readonly groupMemberCollector: GroupMemberCollector = new GroupMemberCollector();
    private readonly multipleEntryPropertyCollector: MultipleEntryPropertyCollector = new MultipleEntryPropertyCollector();
    private readonly interfaceCollector: InterfaceInstanceCollector = new InterfaceInstanceCollector();
    private readonly assemblyInterfacesCollector: AssemblyInterfacesCollector = new AssemblyInterfacesCollector();
    private readonly multipleEntityInstancesCollector: MultipleDocumentPropertyCollectorInterface<"entity_ids",PolymerEntityInstanceInterface> = new MultipleEntityInstancesCollector();

    private setEntityToInstance(entryId: string, map: PolymerEntityInstanceTranslate): void{
        mapSet<PolymerEntityInstanceTranslate>(this.polymerEntityToInstanceMap.get(entryId), map);
    }

    private setEntryToAssembly(entryId: string, map: EntryAssemblyTranslate): void{
        mapSet<EntryAssemblyTranslate>(this.entryToAssemblyMap.get(entryId), map);
    }

    private setGroupProperties(groupId: string, map:GroupPropertiesProvider): void{
        mapSet<GroupPropertiesProvider>(this.groupPropertyMap.get(groupId), map);
    }

    public async getEntityProperties(entityIds:string|Array<string>): Promise<Array<PolymerEntityInstanceInterface>>{
        return getMultipleProperties<"entity_ids",PolymerEntityInstanceInterface>(
            entityIds,
            this.entityPropertyMap,
            this.multipleEntityInstancesCollector,
            "entity_ids",
            (e)=>(e.entryId+TagDelimiter.entity+e.entityId)
        )
    }

    public async getEntryProperties(entryIds:string|Array<string>): Promise<Array<EntryPropertyIntreface>> {
        return getMultipleProperties<"entry_ids",EntryPropertyIntreface>(
            entryIds,
            this.entryPropertyMap,
            this.multipleEntryPropertyCollector,
            "entry_ids",
            (e)=>(e.entryId)
        );
    }

    public async getEntityToInstance(entryId: string): Promise<PolymerEntityInstanceTranslate>{
        const key: string = entryId.toUpperCase();
        if(this.polymerEntityToInstanceMap.get(key)?.status === "available") {
            return this.polymerEntityToInstanceMap.get(key).data;
        } else if (this.polymerEntityToInstanceMap.get(key)?.status === "pending") {
            return await mapResolve<PolymerEntityInstanceTranslate>(this.polymerEntityToInstanceMap.get(key));
        }else{
            mapPending<PolymerEntityInstanceTranslate>(key, this.polymerEntityToInstanceMap);
            const result: Array<PolymerEntityInstanceInterface> = await this.instanceCollector.collect({entry_id: key});
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
            const result: Map<string, Array<PolymerEntityInstanceInterface>> = await this.assemblyCollector.collect({entry_id: key});
            const translator: EntryAssemblyTranslate =  new EntryAssemblyTranslate(result);
            this.setEntryToAssembly(key, translator);
            this.setEntityToInstance(key, new PolymerEntityInstanceTranslate(result.get(EntryAssembliesCollector.modelKey)));
            return translator;
        }
    }

    public async getEntityToChromosome( entityIds: Array<string> ): Promise<PolymerEntityChromosomeTranslate> {
        const chrMap = await this.entityChrCollector.collect(entityIds);
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
            const result:Array<PolymerEntityInstanceInterface> = await this.groupMemberCollector.collect(groupQuery);
            const entriesProperties: Array<EntryPropertyIntreface> = await this.multipleEntryPropertyCollector.collect({entry_ids:Operator.uniqueValues(result.map(r=>r.entryId))})
            const propertiesProvider: GroupPropertiesProvider = new GroupPropertiesProvider({entryProperties: entriesProperties});
            this.setGroupProperties(groupQuery.group_id, propertiesProvider);
            return propertiesProvider;
        }
    }

    public async getSearchQuery(searchQuery: SearchQuery): Promise<QueryResult | null>{
        const key: string = sha1(searchQuery);
        if(this.searchRequestMap.get(key)?.status === "available") {
            return this.searchRequestMap.get(key)?.data;
        }else if(this.searchRequestMap.get(key)?.status === "pending") {
            return await mapResolve<QueryResult|null>(this.searchRequestMap.get(key));
        }else{
            mapPending<QueryResult|null>(key,this.searchRequestMap);
            const searchResult: QueryResult | null = await this. searchRequest.request(searchQuery);
            mapSet<QueryResult|null>(this.searchRequestMap.get(key), searchResult);
            return searchResult;
        }
    }

    public async getSearchQueryFacets(query: SearchQueryType, facets: FacetType[], returnType:ReturnType): Promise<QueryResult | null>{
        const key: string = sha1(query)+"."+sha1(facets);
        if(this.searchRequestMap.get(key)?.status === "available") {
            return this.searchRequestMap.get(key)?.data;
        }else if(this.searchRequestMap.get(key)?.status === "pending") {
            return await mapResolve<QueryResult|null>(this.searchRequestMap.get(key));
        }else{
            mapPending<QueryResult|null>(key,this.searchRequestMap);
            const searchResult: QueryResult | null = await this.searchRequest.requestFacets(query, facets, returnType);
            mapSet<QueryResult|null>(this.searchRequestMap.get(key), searchResult);
            return searchResult;
        }
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
            const result: Array<InterfaceInstanceInterface> = await this.interfaceCollector.collect({interface_ids: assemblyInterfaces.getInterfaces(assemblyId)});
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
            const result: Array<AssemblyInterfacesInterface> = await this.assemblyInterfacesCollector.collect({assembly_ids:[assemblyId]});
            const translator: AssemblyInterfacesTranslate = new AssemblyInterfacesTranslate(result);
            mapSet<AssemblyInterfacesTranslate>(this.assemblyInterfacesMap.get(key), translator);
            return translator;
        }
    }

}

async function getMultipleProperties<C extends string,T>(ids:string|Array<string>, map: Map<string,DataStatusInterface<T>>, collector:MultipleDocumentPropertyCollectorInterface<C,T>, collectorKey: C, propertyKey:(e:T)=>string): Promise<Array<T>>{
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
            const properties: Array<T> = await collector.collect({[collectorKey]:missing} as CollectorArgsType<C>);
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

function mapPending<T>(key:string, hashMap: Map<string,DataStatusInterface<T>>): void{
    hashMap.set(key, {data:null, resolveList: new Array<(x:T)=>void>(), status: "pending"});
}

function mapResolve<T>(map: DataStatusInterface<T>): Promise<T>{
    return new Promise<T>((resolve, reject) => {
        map.resolveList.push(resolve);
    });
}

function mapSet<T>(mapItem: DataStatusInterface<T>, map:T) {
    mapItem.data = map;
    mapItem.status = "available";
    while (mapItem.resolveList.length > 0) {
        mapItem.resolveList.shift()(map);
    }
}

export const rcsbRequestCtxManager = new RcsbRequestContextManager();