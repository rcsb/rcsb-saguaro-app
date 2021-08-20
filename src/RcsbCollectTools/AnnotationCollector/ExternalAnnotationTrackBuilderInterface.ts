import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {AnnotationFeatures} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";

export interface ExternalAnnotationTrackBuilderInterface {
    getRcsbFvRowConfigInterface(): RcsbFvRowConfigInterface;
    processAnnotationFeatures(data: Array<AnnotationFeatures>): void;
    addTo(annotationsConfigData: Array<RcsbFvRowConfigInterface>): void;
}