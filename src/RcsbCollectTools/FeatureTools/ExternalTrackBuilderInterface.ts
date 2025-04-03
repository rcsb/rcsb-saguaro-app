import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {SequenceAlignments, SequenceAnnotations} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Borrego/GqlTypes";
import {PolymerEntityInstanceInterface} from "../DataCollectors/PolymerEntityInstancesCollector";

export interface ExternalTrackBuilderInterface {
    processAlignmentAndFeatures?(data: {annotations?: Array<SequenceAnnotations>; alignments?:SequenceAlignments; rcsbContext?:Partial<PolymerEntityInstanceInterface>}): Promise<void>;
    filterAlignments?(data: {alignments:SequenceAlignments;rcsbContext?:Partial<PolymerEntityInstanceInterface>;}): Promise<SequenceAlignments>;
    filterFeatures?(data:{annotations: Array<SequenceAnnotations>;rcsbContext?:Partial<PolymerEntityInstanceInterface>;}): Promise<Array<SequenceAnnotations>>;
    addTo?(tracks:{alignmentTracks?: Array<RcsbFvRowConfigInterface>, annotationTracks?: Array<RcsbFvRowConfigInterface>; rcsbContext?:Partial<PolymerEntityInstanceInterface>}): Promise<void>;
}