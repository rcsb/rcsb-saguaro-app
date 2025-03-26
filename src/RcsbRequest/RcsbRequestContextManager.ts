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
    QueryPolymer_Entity_GroupArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {GroupMemberCollector} from "../RcsbCollectTools/DataCollectors/GroupMemberCollector";
import {
    EntryPropertyInterface,
    MultipleEntryPropertyCollector
} from "../RcsbCollectTools/DataCollectors/MultipleEntryPropertyCollector";
import {Operator} from "../RcsbUtils/Helpers/Operator";
import {searchRequestProperty} from "../RcsbSeacrh/SearchRequestProperty";
import {FacetType} from "../RcsbSeacrh/FacetStore/FacetMemberInterface";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {sha1} from "object-hash";
import {
    InterfaceInstanceCollector,
    InterfaceInstanceInterface
} from "../RcsbCollectTools/DataCollectors/InterfaceInstanceCollector";
import {
    AssemblyInterfacesCollector
} from "../RcsbCollectTools/DataCollectors/AssemblyInterfacesCollector";
import {ResultsContentType, SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {
    MultipleDocumentPropertyCollectorInterface
} from "../RcsbCollectTools/DataCollectors/DataCollectorInterface";
import {RcsbRequestTools as RRT} from "./RcsbRequestTools";
import {rcsbRequestClient} from "./RcsbRequestClient";
import {GraphQLRequest, RequestConfig} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/GraphQLRequest";
import {SearchRequest} from "@rcsb/rcsb-api-tools/build/RcsbSearch/SearchRequest";
import {Assertions} from "../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;
import {
    MultiplePolymerEntityCollector,
    PolymerEntityInterface
} from "../RcsbCollectTools/DataCollectors/MultiplePolymerEntityCollector";

import { InstanceSequenceInterface,
    MultipleInstanceSequencesCollector
} from "../RcsbCollectTools/DataCollectors/MultipleInstanceSequencesCollector";
import {TagDelimiter} from "@rcsb/rcsb-api-tools/build/RcsbUtils/TagDelimiter";
import {SearchQueryType} from "@rcsb/rcsb-search-tools/lib/SearchQueryTools/SearchQueryInterfaces";

class RcsbRequestContextManager {

    private readonly polymerEntityToInstanceMap: Map<string,Promise<PolymerEntityInstanceTranslate>> = new Map<string, Promise<PolymerEntityInstanceTranslate>>();
    private readonly entryToAssemblyMap: Map<string,Promise<EntryAssemblyTranslate>> = new Map<string, Promise<EntryAssemblyTranslate>>();
    private readonly groupPropertyMap: Map<string,Promise<GroupPropertiesProvider>> = new Map<string, Promise<GroupPropertiesProvider>>();
    private readonly searchRequestMap: Map<string,Promise<QueryResult|null>> = new Map<string, Promise<QueryResult|null>>();
    private readonly interfaceToInstanceMap: Map<string,Promise<InterfaceInstanceTranslate>> = new Map<string, Promise<InterfaceInstanceTranslate>>();
    private readonly assemblyInterfacesMap: Map<string,Promise<AssemblyInterfacesTranslate>> = new Map<string, Promise<AssemblyInterfacesTranslate>>();
    private readonly entryPropertyMap: Map<string,Promise<EntryPropertyInterface>> = new Map<string, Promise<EntryPropertyInterface>>();
    private readonly entityPropertyMap: Map<string,Promise<PolymerEntityInterface>> = new Map<string, Promise<PolymerEntityInterface>>();
    private readonly instanceSequenceMap: Map<string,Promise<InstanceSequenceInterface>> = new Map<string, Promise<InstanceSequenceInterface>>();

    private readonly instanceCollector: PolymerEntityInstancesCollector = new PolymerEntityInstancesCollector();
    private readonly assemblyCollector: EntryAssembliesCollector = new EntryAssembliesCollector();
    private readonly entityChrCollector: PolymerEntityChromosomeCollector = new PolymerEntityChromosomeCollector();
    private readonly groupMemberCollector: GroupMemberCollector = new GroupMemberCollector();
    private readonly multipleEntryPropertyCollector: MultipleEntryPropertyCollector = new MultipleEntryPropertyCollector();
    private readonly interfaceCollector: InterfaceInstanceCollector = new InterfaceInstanceCollector();
    private readonly assemblyInterfacesCollector: AssemblyInterfacesCollector = new AssemblyInterfacesCollector();
    private readonly multipleEntityCollector: MultipleDocumentPropertyCollectorInterface<"entity_ids",PolymerEntityInterface> = new MultiplePolymerEntityCollector();
    private readonly multipleInstanceSequenceCollector:  MultipleDocumentPropertyCollectorInterface<"instance_ids",InstanceSequenceInterface> = new MultipleInstanceSequencesCollector();

    public readonly modelKey: string = EntryAssembliesCollector.modelKey;

    public async getEntityProperties(entityIds:string|Array<string>): Promise<Array<PolymerEntityInterface>>{
        return RRT.getMultipleObjectProperties<"entity_ids",PolymerEntityInterface>(
            entityIds,
            this.entityPropertyMap,
            this.multipleEntityCollector,
            "entity_ids",
            (e)=>(e.entryId+TagDelimiter.entity+e.entityId)
        )
    }

    public async getEntryProperties(entryIds:string|Array<string>): Promise<Array<EntryPropertyInterface>> {
        return RRT.getMultipleObjectProperties<"entry_ids",EntryPropertyInterface>(
            entryIds,
            this.entryPropertyMap,
            this.multipleEntryPropertyCollector,
            "entry_ids",
            (e)=>(e.entryId)
        );
    }

    public async getInstanceSequences(instanceIds:string|string[]): Promise<InstanceSequenceInterface[]> {
        return RRT.getMultipleObjectProperties<"instance_ids", InstanceSequenceInterface>(
            instanceIds,
            this.instanceSequenceMap,
            this.multipleInstanceSequenceCollector,
            "instance_ids",
            (e)=>(e.rcsbId)
        )
    }

    public async getEntityToInstance(entryId: string): Promise<PolymerEntityInstanceTranslate>{
        const key: string = entryId.toUpperCase();
        return RRT.getSingleObjectData<PolymerEntityInstanceTranslate>(
            key,
            this.polymerEntityToInstanceMap,
            async ()=>(new PolymerEntityInstanceTranslate(await this.instanceCollector.collect({entry_id: key})))
        )
    }

    public async getEntryToAssembly(entryId: string): Promise<EntryAssemblyTranslate>{
        return RRT.getSingleObjectData<EntryAssemblyTranslate>(
            entryId,
            this.entryToAssemblyMap,
            async ()=>{
                const result: Map<string, Array<PolymerEntityInstanceInterface>> = await this.assemblyCollector.collect({entry_id: entryId});
                const  eti = this.polymerEntityToInstanceMap.get(entryId);
                const etit = result.get(this.modelKey);
                assertDefined(eti), assertDefined(etit);
                return new EntryAssemblyTranslate(result);
            }
        );
    }

    public async getEntityToChromosome( entityIds: Array<string> ): Promise<PolymerEntityChromosomeTranslate> {
        const chrMap = await this.entityChrCollector.collect(entityIds);
        return new PolymerEntityChromosomeTranslate(chrMap);
    }

    public async getGroupMemberProperties(groupQuery: QueryPolymer_Entity_GroupArgs): Promise<GroupPropertiesProvider>{
        const groupId: string = groupQuery.group_id.toUpperCase();
        return RRT.getSingleObjectData<GroupPropertiesProvider>(
            groupId,
            this.groupPropertyMap,
            async ()=>{
                const result:Array<PolymerEntityInstanceInterface> = await this.groupMemberCollector.collect(groupQuery);
                const entriesProperties: Array<EntryPropertyInterface> = await this.multipleEntryPropertyCollector.collect({entry_ids:Operator.uniqueValues(result.map(r=>r.entryId))})
                return new GroupPropertiesProvider({entryProperties: entriesProperties});
            }
        );
    }

    public async getSearchQuery(searchQuery: SearchQuery): Promise<QueryResult | null>{
        const key: string = sha1(searchQuery);
        return RRT.getSingleObjectData<QueryResult | null>(
            key,
            this.searchRequestMap,
            async ()=>(await searchRequestProperty.request(searchQuery))
        );
    }

    public async getSearchQueryFacets(query: SearchQueryType, facets: FacetType[], returnType:ReturnType, resultsContentType:ResultsContentType): Promise<QueryResult | null>{
        const key: string = sha1(query)+"."+sha1(facets);
        return RRT.getSingleObjectData<QueryResult | null>(
            key,
            this.searchRequestMap,
            async ()=>(await searchRequestProperty.requestFacets(query, facets, returnType, resultsContentType))
        );
    }

    public async getInterfaceToInstance(interfaceId:string): Promise<InterfaceInstanceTranslate>{
        const key: string = interfaceId;
        const assemblyId = interfaceId.split(TagDelimiter.instance)[0];
        if(this.interfaceToInstanceMap.get(key)){
            const d = this.interfaceToInstanceMap.get(key);
            assertDefined(d);
            return d;
        }else{
            const assemblyInterfaces = await this.getAssemblyInterfaces(assemblyId);
            const interfaceIds = assemblyInterfaces.getInterfaces(assemblyId);
            const result: InterfaceInstanceInterface[] = interfaceIds ? await this.interfaceCollector.collect({interface_ids: interfaceIds}) : [];
            const translator: InterfaceInstanceTranslate =  new InterfaceInstanceTranslate(result);
            if (assemblyInterfaces.getInterfaces(assemblyId)?.length == 0){
                this.interfaceToInstanceMap.set(key, new Promise(resolve => resolve(translator)));
            }
            (assemblyInterfaces.getInterfaces(assemblyId) ?? []).filter(id=>!this.interfaceToInstanceMap.has(id)).forEach(id=>{
                this.interfaceToInstanceMap.set(id, new Promise(resolve => resolve(translator)));
            });
            return translator;
        }
    }

    private async getAssemblyInterfaces(assemblyId:string): Promise<AssemblyInterfacesTranslate> {
        return RRT.getSingleObjectData<AssemblyInterfacesTranslate>(
            assemblyId,
            this.assemblyInterfacesMap,
            async ()=>(
                new AssemblyInterfacesTranslate(await this.assemblyInterfacesCollector.collect({assembly_ids:[assemblyId]}))
            )
        );
    }

    public initializeBorregoClient(config: {api?:string, requestConfig?:RequestConfig}): void {
        rcsbRequestClient.borrego = new GraphQLRequest(config.api ?? "1d-coordinates", config.requestConfig);
    }

    public initializeYosemiteClient(config: {api?:string, requestConfig?:RequestConfig}): void {
        rcsbRequestClient.yosemite = new GraphQLRequest(config.api ?? "data-api", config.requestConfig);
    }

    public initializeArchesClient(config: {uri?:string, fetch?:(input: RequestInfo, requestConfig?: RequestInit) => Promise<Response>, requestConfig?:RequestInit}){
        rcsbRequestClient.arches = new SearchRequest(config.uri, config.fetch, config.requestConfig);
    }

}

export const rcsbRequestCtxManager = new RcsbRequestContextManager();