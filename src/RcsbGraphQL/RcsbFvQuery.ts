import RcsbQueryAnnotations, {
    RequestAnnotationsInterface
} from "../RcsbGraphQL/RcsbQueryAnnotations";
import RcsbQueryAlignment, {
    RequestAlignmentInterface,
} from "../RcsbGraphQL/RcsbQueryAlignment";
import {AlignmentResponse, AnnotationFeatures} from "./Types/GqlTypes";

export class RcsbFvQuery {

    private rcsbFvQueryAnnotations:RcsbQueryAnnotations = new RcsbQueryAnnotations();
    private rcsbFvQueryAlignment:RcsbQueryAlignment = new RcsbQueryAlignment();

    public requestAnnotations(requestConfig: RequestAnnotationsInterface): Promise<Array<AnnotationFeatures>>{
        return this.rcsbFvQueryAnnotations.request(requestConfig);
    }

    public requestAlignment(requestConfig: RequestAlignmentInterface): Promise<AlignmentResponse>{
        return this.rcsbFvQueryAlignment.request(requestConfig);
    }

}