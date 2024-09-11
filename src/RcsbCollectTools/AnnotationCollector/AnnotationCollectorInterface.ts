import {
    SequenceAnnotations,
    Features,
    QueryAnnotationsArgs,
    QueryGroup_AnnotationsArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {FeaturePositionGaps} from "../../RcsbFvWeb/RcsbFvFactories/RcsbFvBlockFactory/BlockManager/AnnotationTrackManager";
import {ExternalTrackBuilderInterface} from "../FeatureTools/ExternalTrackBuilderInterface";
import {PolymerEntityInstanceInterface} from "../DataCollectors/PolymerEntityInstancesCollector";
import {
    TrackManagerInterface
} from "../../RcsbFvWeb/RcsbFvFactories/RcsbFvBlockFactory/BlockManager/TrackManagerInterface";

export type IncreaseAnnotationValueType = (feature:{type:string; targetId:string; positionKey:string; d:Features; p:FeaturePositionGaps;})=>number;
export interface AnnotationProcessingInterface {
    getAnnotationValue?:IncreaseAnnotationValueType;
    computeAnnotationValue?:(annotationTracks: Map<string, TrackManagerInterface>)=>void;
    addTrackElementCallback?:IncreaseAnnotationValueType;
}

export interface CommonAnnotationInterface {
    rcsbContext?:Partial<PolymerEntityInstanceInterface>;
    annotationProcessing?: AnnotationProcessingInterface;
    externalTrackBuilder?: ExternalTrackBuilderInterface;
    annotationGenerator?(annotations: Array<SequenceAnnotations>): Promise<Array<SequenceAnnotations>>;
    annotationFilter?(annotations: Array<SequenceAnnotations>): Promise<Array<SequenceAnnotations>>;
    titleSuffix?(ann: SequenceAnnotations, d: Features): Promise<string|undefined>;
    trackTitle?(ann: SequenceAnnotations, d: Features): Promise<string|undefined>;
    typeSuffix?(ann: SequenceAnnotations, d: Features): Promise<string|undefined>;
}

export interface AnnotationsCollectConfig extends QueryAnnotationsArgs, CommonAnnotationInterface {
}

export interface CollectGroupAnnotationsInterface extends QueryGroup_AnnotationsArgs, CommonAnnotationInterface {
}

export type AnnotationRequestContext = Partial<AnnotationsCollectConfig & CollectGroupAnnotationsInterface>;

export interface AnnotationCollectorInterface {
    collect(requestConfig: AnnotationsCollectConfig | CollectGroupAnnotationsInterface): Promise<Array<SequenceAnnotations>>;
    getAnnotationFeatures(): Promise<Array<SequenceAnnotations>>;
    getFeatures(): Promise<Array<Features>>;
}