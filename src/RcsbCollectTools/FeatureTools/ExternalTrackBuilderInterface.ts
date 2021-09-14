import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {AlignmentResponse, AnnotationFeatures} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";

export interface ExternalTrackBuilderInterface {
    getRcsbFvRowConfigInterface(): RcsbFvRowConfigInterface;
    processAnnotationFeatures(data: {annotations?: Array<AnnotationFeatures>; alignment?:AlignmentResponse}): void;
    addTo(annotationsConfigData: Array<RcsbFvRowConfigInterface>): void;
}