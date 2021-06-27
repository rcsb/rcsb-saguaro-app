import {RcsbQueryAnnotations} from "./RcsbQueryAnnotations";
import {RcsbQueryAlignment} from "./RcsbQueryAlignment";
import {
    AlignmentResponse,
    AnnotationFeatures,
    QueryAlignmentArgs,
    QueryAnnotationsArgs
} from "./Types/Borrego/GqlTypes";
import {
    CoreEntry, CoreGroup, CorePolymerEntity,
    QueryEntryArgs, QueryPolymer_EntitiesArgs, QueryUniprot_Entity_GroupArgs,
} from "./Types/Yosemite/GqlTypes";
import {RcsbQueryEntryInstances} from "./RcsbQueryEntryInstances";
import {RcsbQueryMultipleEntityInstances} from "./RcsbQueryMultipleEntityInstances";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {RcsbQueryUniprotEntityGroup} from "./RcsbQueryUniprotEntityGroup";

export class RcsbClient {
    private rcsbQueryAnnotations: RcsbCoreQueryInterface<QueryAnnotationsArgs,Array<AnnotationFeatures>> = new RcsbQueryAnnotations();
    private rcsbQueryAlignment: RcsbCoreQueryInterface<QueryAlignmentArgs,AlignmentResponse> = new RcsbQueryAlignment();
    private rcsbQueryEntityInstances: RcsbCoreQueryInterface<QueryEntryArgs,CoreEntry> = new RcsbQueryEntryInstances();
    private rcsbQueryMutipleEntityInstances: RcsbCoreQueryInterface<QueryPolymer_EntitiesArgs,Array<CorePolymerEntity>> = new RcsbQueryMultipleEntityInstances();
    private rcsbQueryUniprotEntityGroup: RcsbCoreQueryInterface<QueryUniprot_Entity_GroupArgs,CoreGroup> = new RcsbQueryUniprotEntityGroup();

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

    public async requestUniprotEntityGroup(requestConfig: QueryUniprot_Entity_GroupArgs): Promise<CoreGroup>{
        return await this.rcsbQueryUniprotEntityGroup.request(requestConfig);
    }
}