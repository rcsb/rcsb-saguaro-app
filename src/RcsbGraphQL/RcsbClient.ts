import {RcsbQueryAnnotations} from "./RcsbQueryAnnotations";
import {RcsbQueryAlignment} from "./RcsbQueryAlignment";
import {
    AlignmentResponse,
    AnnotationFeatures,
    QueryAlignmentArgs,
    QueryAnnotationsArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    CoreEntry, CoreInterface, CorePolymerEntity, QueryEntriesArgs,
    QueryEntryArgs, QueryInterfacesArgs, QueryPolymer_EntitiesArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {RcsbQueryEntryInstances} from "./RcsbQueryEntryInstances";
import {RcsbQueryMultipleEntityInstances} from "./RcsbQueryMultipleEntityInstances";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {RcsbQueryMultipleEntriesProperties} from "./RcsbQueryMultipleEntriesProperties";
import {RcsbQueryInterfaceInstances} from "./RcsbQueryInterfaceInstances";

export class RcsbClient {
    private rcsbQueryAnnotations: RcsbCoreQueryInterface<QueryAnnotationsArgs,Array<AnnotationFeatures>> = new RcsbQueryAnnotations();
    private rcsbQueryAlignment: RcsbCoreQueryInterface<QueryAlignmentArgs,AlignmentResponse> = new RcsbQueryAlignment();
    private rcsbQueryEntityInstances: RcsbCoreQueryInterface<QueryEntryArgs,CoreEntry> = new RcsbQueryEntryInstances();
    private rcsbQueryMutipleEntityInstances: RcsbCoreQueryInterface<QueryPolymer_EntitiesArgs,Array<CorePolymerEntity>> = new RcsbQueryMultipleEntityInstances();
    private rcsbQueryEntryProperties: RcsbCoreQueryInterface<QueryEntriesArgs,Array<CoreEntry>> = new RcsbQueryMultipleEntriesProperties();
    private rcsbQueryInterfaceInstances: RcsbCoreQueryInterface<QueryInterfacesArgs,Array<CoreInterface>> = new RcsbQueryInterfaceInstances();

    public async requestRcsbPdbAnnotations(requestConfig: QueryAnnotationsArgs): Promise<Array<AnnotationFeatures>>{
        return await this.rcsbQueryAnnotations.request(requestConfig);
    }

    public async requestAlignment(requestConfig: QueryAlignmentArgs): Promise<AlignmentResponse>{
        return await this.rcsbQueryAlignment.request(requestConfig);
    }

    public async requestEntityInstances(requestConfig: QueryEntryArgs): Promise<CoreEntry>{
        return await this.rcsbQueryEntityInstances.request(requestConfig);
    }

    public async requestMultipleEntityInstances(requestConfig: QueryPolymer_EntitiesArgs): Promise<Array<CorePolymerEntity>>{
        return await this.rcsbQueryMutipleEntityInstances.request(requestConfig);
    }

    public async requestMultipleEntriesProperties(requestConfig: QueryEntriesArgs): Promise<Array<CoreEntry>>{
        return await this.rcsbQueryEntryProperties.request(requestConfig);
    }

    public async requestInterfaceInstances(requestConfig:QueryInterfacesArgs): Promise<Array<CoreInterface>> {
        return await this.rcsbQueryInterfaceInstances.request(requestConfig);
    }
}