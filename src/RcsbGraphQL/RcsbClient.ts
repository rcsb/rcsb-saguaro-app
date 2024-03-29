import {RcsbQueryAnnotations, RcsbQueryGroupAnnotations} from "./RcsbQueryAnnotations";
import {RcsbQueryAlignment, RcsbQueryGroupAlignment, RcsbQueryGroupAlignmentArguments} from "./RcsbQueryAlignment";
import {
    AlignmentResponse,
    AnnotationFeatures,
    QueryAlignmentArgs,
    QueryAnnotationsArgs, QueryGroup_AnnotationsArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    CoreAssembly,
    CoreEntry,
    CoreInterface,
    CorePolymerEntity,
    QueryAssembliesArgs,
    GroupPolymerEntity,
    QueryEntriesArgs,
    QueryEntryArgs,
    QueryInterfacesArgs,
    QueryPolymer_EntitiesArgs,
    QueryPolymer_Entity_GroupArgs,
    QueryPolymer_Entity_InstancesArgs, CorePolymerEntityInstance
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {RcsbQueryEntryInstances} from "./RcsbQueryEntryInstances";
import {RcsbQueryMultipleEntityInstances} from "./RcsbQueryMultipleEntityInstances";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {RcsbQueryGroup} from "./RcsbQueryGroup";
import {RcsbQueryMultipleEntriesProperties} from "./RcsbQueryMultipleEntriesProperties";
import {RcsbQueryInterfaceInstances} from "./RcsbQueryInterfaceInstances";
import {RcsbQueryAssemblyInterfaces} from "./RcsbQueryAssemblyInterfaces";
import {rcsbRequestClient} from "../RcsbRequest/RcsbRequestClient";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools";
import {RcsbQueryMultipleInstanceSequences} from "./RcsbQueryMultipleInstanceSequences";

//TODO Implement a cache to store requests and avoid duplication
class RcsbClientClass {

    private readonly rcsbQueryAnnotations: RcsbCoreQueryInterface<QueryAnnotationsArgs,Array<AnnotationFeatures>> ;
    private readonly rcsbQueryGroupAnnotations: RcsbCoreQueryInterface<QueryGroup_AnnotationsArgs,Array<AnnotationFeatures>>;
    private readonly rcsbQueryAlignment: RcsbCoreQueryInterface<QueryAlignmentArgs,AlignmentResponse>;
    private readonly rcsbQueryGroupAlignment: RcsbCoreQueryInterface<RcsbQueryGroupAlignmentArguments,AlignmentResponse>;
    private readonly rcsbQueryEntityInstances: RcsbCoreQueryInterface<QueryEntryArgs,CoreEntry>;
    private readonly rcsbQueryMutipleEntityInstances: RcsbCoreQueryInterface<QueryPolymer_EntitiesArgs,Array<CorePolymerEntity>>;
    private readonly rcsbQueryEntryProperties: RcsbCoreQueryInterface<QueryEntriesArgs,Array<CoreEntry>>;
    private readonly rcsbQueryInterfaceInstances: RcsbCoreQueryInterface<QueryInterfacesArgs,Array<CoreInterface>>;
    private readonly rcsbQueryAssemblyInterfaces: RcsbCoreQueryInterface<QueryAssembliesArgs,Array<CoreAssembly>>;
    private readonly rcsbQueryGroup: RcsbCoreQueryInterface<QueryPolymer_Entity_GroupArgs,GroupPolymerEntity>;
    private readonly rcsbQueryMultipleInstanceSequences: RcsbCoreQueryInterface<QueryPolymer_Entity_InstancesArgs, CorePolymerEntityInstance[]>;

    constructor(get:{borrego: ()=>GraphQLRequest, yosemite: ()=>GraphQLRequest}){
        this.rcsbQueryAnnotations = new RcsbQueryAnnotations(get.borrego);
        this.rcsbQueryGroupAnnotations = new RcsbQueryGroupAnnotations(get.borrego);
        this.rcsbQueryAlignment = new RcsbQueryAlignment(get.borrego);
        this.rcsbQueryGroupAlignment = new RcsbQueryGroupAlignment(get.borrego);
        this.rcsbQueryEntityInstances = new RcsbQueryEntryInstances(get.yosemite);
        this.rcsbQueryMutipleEntityInstances = new RcsbQueryMultipleEntityInstances(get.yosemite);
        this.rcsbQueryEntryProperties = new RcsbQueryMultipleEntriesProperties(get.yosemite);
        this.rcsbQueryInterfaceInstances = new RcsbQueryInterfaceInstances(get.yosemite);
        this.rcsbQueryAssemblyInterfaces = new RcsbQueryAssemblyInterfaces(get.yosemite);
        this.rcsbQueryGroup = new RcsbQueryGroup(get.yosemite);
        this.rcsbQueryMultipleInstanceSequences = new RcsbQueryMultipleInstanceSequences(get.yosemite);
    }

    public async requestRcsbPdbAnnotations(requestConfig: QueryAnnotationsArgs): Promise<Array<AnnotationFeatures>>{
        return await this.rcsbQueryAnnotations.request(requestConfig);
    }

    public async requestRcsbPdbGroupAnnotations(requestConfig: QueryGroup_AnnotationsArgs): Promise<Array<AnnotationFeatures>>{
        return await this.rcsbQueryGroupAnnotations.request(requestConfig);
    }

    public async requestAlignment(requestConfig: QueryAlignmentArgs): Promise<AlignmentResponse>{
        return await this.rcsbQueryAlignment.request(requestConfig);
    }

    public async requestGroupAlignment(requestConfig: RcsbQueryGroupAlignmentArguments): Promise<AlignmentResponse>{
        return await this.rcsbQueryGroupAlignment.request(requestConfig);
    }

    public async requestEntityInstances(requestConfig: QueryEntryArgs): Promise<CoreEntry>{
        return await this.rcsbQueryEntityInstances.request(requestConfig);
    }

    public async requestMultipleEntityInstances(requestConfig: QueryPolymer_EntitiesArgs): Promise<Array<CorePolymerEntity>>{
        return await this.rcsbQueryMutipleEntityInstances.request(requestConfig);
    }

    public async requestGroupInfo(requestConfig: QueryPolymer_Entity_GroupArgs): Promise<GroupPolymerEntity>{
        return await this.rcsbQueryGroup.request(requestConfig);
    }

    public async requestMultipleEntriesProperties(requestConfig: QueryEntriesArgs): Promise<Array<CoreEntry>>{
        return await this.rcsbQueryEntryProperties.request(requestConfig);
    }

    public async requestInterfaceInstances(requestConfig:QueryInterfacesArgs): Promise<Array<CoreInterface>> {
        return await this.rcsbQueryInterfaceInstances.request(requestConfig);
    }

    public async requestAssemblyInterfaces(requestConfig:QueryAssembliesArgs): Promise<Array<CoreAssembly>> {
        return await this.rcsbQueryAssemblyInterfaces.request(requestConfig);
    }

    public async requestMultipleInstanceSequences(requestConfig: QueryPolymer_Entity_InstancesArgs): Promise<CorePolymerEntityInstance[]> {
        return await this.rcsbQueryMultipleInstanceSequences.request(requestConfig);
    }
}

export const rcsbClient: RcsbClientClass = new RcsbClientClass({borrego: ()=>rcsbRequestClient.borrego, yosemite: ()=>rcsbRequestClient.yosemite});
export type RcsbClient = typeof rcsbClient;
