import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {AlignmentResponse, AnnotationFeatures} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {SequenceCollectorDataInterface} from "../SequenceCollector/SequenceCollector";

export interface ExternalTrackBuilderInterface {
    processAlignmentAndFeatures(data: {annotations?: Array<AnnotationFeatures>; alignments?:AlignmentResponse;}): void;
    filterFeatures(annotations: Array<AnnotationFeatures>): void;
    addTo(tracks:{alignmentTracks?: SequenceCollectorDataInterface, annotationTracks?: Array<RcsbFvRowConfigInterface>}): void;
}