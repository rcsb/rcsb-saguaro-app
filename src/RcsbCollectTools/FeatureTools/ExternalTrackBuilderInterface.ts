import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {AlignmentResponse, AnnotationFeatures} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {PolymerEntityInstanceInterface} from "../DataCollectors/PolymerEntityInstancesCollector";

export interface ExternalTrackBuilderInterface {
    processAlignmentAndFeatures?(data: {annotations?: AnnotationFeatures[]; alignments?:AlignmentResponse; rcsbContext?:Partial<PolymerEntityInstanceInterface>}): Promise<void>;
    filterAlignments?(data: {alignments:AlignmentResponse;rcsbContext?:Partial<PolymerEntityInstanceInterface>;}): Promise<AlignmentResponse>;
    filterFeatures?(data:{annotations: AnnotationFeatures[];rcsbContext?:Partial<PolymerEntityInstanceInterface>;}): Promise<AnnotationFeatures[]>;
    addTo?(tracks:{alignmentTracks?: RcsbFvRowConfigInterface[], annotationTracks?: RcsbFvRowConfigInterface[]; rcsbContext?:Partial<PolymerEntityInstanceInterface>}): Promise<void>;
}