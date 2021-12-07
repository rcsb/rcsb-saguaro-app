import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {AlignmentResponse, AnnotationFeatures} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {SequenceCollectorDataInterface} from "../SequenceCollector/SequenceCollector";
import {PolymerEntityInstanceInterface} from "../Translators/PolymerEntityInstancesCollector";

export interface ExternalTrackBuilderInterface {
    processAlignmentAndFeatures?(data: {annotations?: Array<AnnotationFeatures>; alignments?:AlignmentResponse; rcsbContext?:Partial<PolymerEntityInstanceInterface>}): Promise<void>;
    filterAlignments?(alignments:AlignmentResponse): Promise<AlignmentResponse>;
    filterFeatures?(annotations: Array<AnnotationFeatures>): Promise<Array<AnnotationFeatures>>;
    addTo?(tracks:{alignmentTracks?: SequenceCollectorDataInterface, annotationTracks?: Array<RcsbFvRowConfigInterface>; rcsbContext?:Partial<PolymerEntityInstanceInterface>}): Promise<void>;
}