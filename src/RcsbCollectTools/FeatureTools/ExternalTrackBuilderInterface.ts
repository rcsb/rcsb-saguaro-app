import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {AlignmentResponse, AnnotationFeatures} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {PolymerEntityInstanceInterface} from "../DataCollectors/PolymerEntityInstancesCollector";

export interface ExternalTrackBuilderInterface {
    processAlignmentAndFeatures?(data: {annotations?: Array<AnnotationFeatures>; alignments?:AlignmentResponse; rcsbContext?:Partial<PolymerEntityInstanceInterface>}): Promise<void>;
    filterAlignments?(data: {alignments:AlignmentResponse;rcsbContext?:Partial<PolymerEntityInstanceInterface>;}): Promise<AlignmentResponse>;
    filterFeatures?(data:{annotations: Array<AnnotationFeatures>;rcsbContext?:Partial<PolymerEntityInstanceInterface>;}): Promise<Array<AnnotationFeatures>>;
    addTo?(tracks:{alignmentTracks?: Array<RcsbFvRowConfigInterface>, annotationTracks?: Array<RcsbFvRowConfigInterface>; rcsbContext?:Partial<PolymerEntityInstanceInterface>}): Promise<void>;
}