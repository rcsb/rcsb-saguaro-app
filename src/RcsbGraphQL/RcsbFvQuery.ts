import {RcsbQueryAnnotations} from "./RcsbQueryAnnotations";
import {RcsbQueryAlignment} from "./RcsbQueryAlignment";
import {
    AlignmentResponse,
    AnnotationFeatures,
    QueryAlignmentArgs,
    QueryAnnotationsArgs
} from "./Types/Borrego/GqlTypes";
import {CoreEntry, QueryEntryArgs} from "./Types/Yosemite/GqlTypes";
import {RcsbQueryEntryInstances} from "./RcsbQueryEntryInstances";

export class RcsbFvQuery {

    private rcsbFvQueryAnnotations:RcsbQueryAnnotations = new RcsbQueryAnnotations();
    private rcsbFvQueryAlignment:RcsbQueryAlignment = new RcsbQueryAlignment();
    private rcsbFvQueryEntityInstances: RcsbQueryEntryInstances = new RcsbQueryEntryInstances();

    public requestRcsbPdbAnnotations(requestConfig: QueryAnnotationsArgs): Promise<Array<AnnotationFeatures>>{
        return this.rcsbFvQueryAnnotations.request(requestConfig);
    }

    public requestAlignment(requestConfig: QueryAlignmentArgs): Promise<AlignmentResponse>{
        return this.rcsbFvQueryAlignment.request(requestConfig);
    }

    public requestEntityInstances(requestConfig: QueryEntryArgs): Promise<CoreEntry>{
        return this.rcsbFvQueryEntityInstances.request(requestConfig);
    }

}