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
    EntryPropertyIntreface,
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
import DataStatusInterface = RRT.DataStatusInterface;
import {rcsbRequestClient} from "./RcsbRequestClient";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/GraphQLRequest";
import {SearchRequest} from "@rcsb/rcsb-api-tools/build/RcsbSearch/SearchRequest";
import {RequestConfig as GraphqlRequestInit} from "graphql-request/src/types";
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

    private readonly polymerEntityToInstanceMap: Map<string,DataStatusInterface<PolymerEntityInstanceTranslate>> = new Map<string, DataStatusInterface<PolymerEntityInstanceTranslate>>();
    private readonly entryToAssemblyMap: Map<string,DataStatusInterface<EntryAssemblyTranslate>> = new Map<string, DataStatusInterface<EntryAssemblyTranslate>>();
    private readonly groupPropertyMap: Map<string,DataStatusInterface<GroupPropertiesProvider>> = new Map<string, DataStatusInterface<GroupPropertiesProvider>>();
    private readonly searchRequestMap: Map<string,DataStatusInterface<QueryResult|null>> = new Map<string, DataStatusInterface<QueryResult|null>>();
    private readonly interfaceToInstanceMap: Map<string,DataStatusInterface<InterfaceInstanceTranslate>> = new Map<string, DataStatusInterface<InterfaceInstanceTranslate>>();
    private readonly assemblyInterfacesMap: Map<string,DataStatusInterface<AssemblyInterfacesTranslate>> = new Map<string, DataStatusInterface<AssemblyInterfacesTranslate>>();
    private readonly entryPropertyMap: Map<string,DataStatusInterface<EntryPropertyIntreface>> = new Map<string, DataStatusInterface<EntryPropertyIntreface>>();
    private readonly entityPropertyMap: Map<string,DataStatusInterface<PolymerEntityInterface>> = new Map<string, DataStatusInterface<PolymerEntityInterface>>();
    private readonly instanceSequenceMap: Map<string,DataStatusInterface<InstanceSequenceInterface>> = new Map<string, DataStatusInterface<InstanceSequenceInterface>>();

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

    public async getEntryProperties(entryIds:string|Array<string>): Promise<Array<EntryPropertyIntreface>> {
        return RRT.getMultipleObjectProperties<"entry_ids",EntryPropertyIntreface>(
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
                RRT.mapPending<PolymerEntityInstanceTranslate>(entryId, this.polymerEntityToInstanceMap);
                const result: Map<string, Array<PolymerEntityInstanceInterface>> = await this.assemblyCollector.collect({entry_id: entryId});
                const  eti = this.polymerEntityToInstanceMap.get(entryId);
                const etit = result.get(this.modelKey);
                assertDefined(eti), assertDefined(etit);
                RRT.mapSet<PolymerEntityInstanceTranslate>(eti, new PolymerEntityInstanceTranslate(etit));
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
                const entriesProperties: Array<EntryPropertyIntreface> = await this.multipleEntryPropertyCollector.collect({entry_ids:Operator.uniqueValues(result.map(r=>r.entryId))})
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
        if(this.interfaceToInstanceMap.get(key)?.status === "available"){
            const d = this.interfaceToInstanceMap.get(key)?.data;
            assertDefined(d)
            return d;
        } else if(this.interfaceToInstanceMap.get(key)?.status === "pending"){
            const o = this.interfaceToInstanceMap.get(key);
            assertDefined(o);
            return await RRT.mapResolve<InterfaceInstanceTranslate>(o);
        }else if (this.assemblyInterfacesMap.get(assemblyId)?.status === "pending"){
            RRT.mapPending<InterfaceInstanceTranslate>(key, this.interfaceToInstanceMap);
            const o = this.interfaceToInstanceMap.get(key);
            assertDefined(o);
            return await RRT.mapResolve<InterfaceInstanceTranslate>(o);
        }else{
            RRT.mapPending<InterfaceInstanceTranslate>(key, this.interfaceToInstanceMap);
            const assemblyInterfaces = await this.getAssemblyInterfaces(assemblyId);
            const interfaceIds = assemblyInterfaces.getInterfaces(assemblyId);
            const result: InterfaceInstanceInterface[] = interfaceIds ? await this.interfaceCollector.collect({interface_ids: interfaceIds}) : [];
            const translator: InterfaceInstanceTranslate =  new InterfaceInstanceTranslate(result);
            if (assemblyInterfaces.getInterfaces(assemblyId)?.length == 0){
                this.interfaceToInstanceMap.set(key,{
                    data: translator,
                    status: "available",
                    resolveList: []
                });
            }
            for(const id of assemblyInterfaces.getInterfaces(assemblyId) ?? []) {
                if (this.interfaceToInstanceMap.get(id)?.status === "pending") {
                    const o = this.interfaceToInstanceMap.get(id);
                    assertDefined(o);
                    RRT.mapSet<InterfaceInstanceTranslate>(o, translator);
                } else {
                    this.interfaceToInstanceMap.set(id, {
                        data: translator,
                        status: "available",
                        resolveList: []
                    });
                }
            }
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

    public initializeBorregoClient(config: {api?:string, requestConfig?:GraphqlRequestInit}): void {
        rcsbRequestClient.borrego = new GraphQLRequest(config.api ?? "1d-coordinates", config.requestConfig);
    }

    public initializeYosemiteClient(config: {api?:string, requestConfig?:GraphqlRequestInit}): void {
        rcsbRequestClient.yosemite = new GraphQLRequest(config.api ?? "data-api", config.requestConfig);
    }

    public initializeArchesClient(config: {uri?:string, fetch?:(input: RequestInfo, requestConfig?: RequestInit) => Promise<Response>, requestConfig?:RequestInit}){
        rcsbRequestClient.arches = new SearchRequest(config.uri, config.fetch, config.requestConfig);
    }

}

export const rcsbRequestCtxManager = new RcsbRequestContextManager();