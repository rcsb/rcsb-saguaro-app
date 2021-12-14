import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {AlignmentResponse, AnnotationFeatures} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {SequenceCollectorDataInterface} from "../SequenceCollector/SequenceCollector";
import {PolymerEntityInstanceInterface} from "../Translators/PolymerEntityInstancesCollector";

export interface ExternalTrackBuilderInterface {
    processAlignmentAndFeatures?(data: {annotations?: Array<AnnotationFeatures>; alignments?:AlignmentResponse; rcsbContext?:Partial<PolymerEntityInstanceInterface>}): Promise<void>;
    filterAlignments?(data: {alignments:AlignmentResponse;rcsbContext?:Partial<PolymerEntityInstanceInterface>;}): Promise<AlignmentResponse>;
    filterFeatures?(data:{annotations: Array<AnnotationFeatures>;rcsbContext?:Partial<PolymerEntityInstanceInterface>;}): Promise<Array<AnnotationFeatures>>;
    addTo?(tracks:{alignmentTracks?: SequenceCollectorDataInterface, annotationTracks?: Array<RcsbFvRowConfigInterface>; rcsbContext?:Partial<PolymerEntityInstanceInterface>}): Promise<void>;
}