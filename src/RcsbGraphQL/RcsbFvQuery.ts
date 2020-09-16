import {RcsbQueryAnnotations} from "./RcsbQueryAnnotations";
import {RcsbQueryAlignment} from "./RcsbQueryAlignment";
import {
    AlignmentResponse,
    AnnotationFeatures,
    QueryAlignmentArgs,
    QueryAnnotationsArgs
} from "./Types/Borrego/GqlTypes";
import {
    CoreEntry,
    CorePolymerEntityInstance,
    QueryEntryArgs,
    QueryPolymer_Entity_InstancesArgs
} from "./Types/Yosemite/GqlTypes";
import {RcsbQueryEntryInstances} from "./RcsbQueryEntryInstances";
import {RcsbQueryMultipleEntityInstances} from "./RcsbQueryMultipleEntityInstances";

export class RcsbFvQuery {

    private rcsbFvQueryAnnotations:RcsbQueryAnnotations = new RcsbQueryAnnotations();
    private rcsbFvQueryAlignment:RcsbQueryAlignment = new RcsbQueryAlignment();
    private rcsbFvQueryEntityInstances: RcsbQueryEntryInstances = new RcsbQueryEntryInstances();
    private rcsbFvQueryMutipleEntityInstances: RcsbQueryMultipleEntityInstances = new RcsbQueryMultipleEntityInstances();

    public requestRcsbPdbAnnotations(requestConfig: QueryAnnotationsArgs): Promise<Array<AnnotationFeatures>>{
        return this.rcsbFvQueryAnnotations.request(requestConfig);
    }

    public requestAlignment(requestConfig: QueryAlignmentArgs): Promise<AlignmentResponse>{
        return this.rcsbFvQueryAlignment.request(requestConfig);
    }

    public requestEntityInstances(requestConfig: QueryEntryArgs): Promise<CoreEntry>{
        return this.rcsbFvQueryEntityInstances.request(requestConfig);
    }

    public requestMultipleEntityInstances(requestConfig: QueryPolymer_Entity_InstancesArgs): Promise<Array<CorePolymerEntityInstance>>{
        return this.rcsbFvQueryMutipleEntityInstances.request(requestConfig);
    }
}