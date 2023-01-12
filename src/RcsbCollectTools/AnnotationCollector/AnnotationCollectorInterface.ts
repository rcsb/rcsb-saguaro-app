import {
    AnnotationFeatures,
    Feature,
    QueryAnnotationsArgs,
    QueryGroup_AnnotationsArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {FeaturePositionGaps} from "../../RcsbFvWeb/RcsbFvFactories/RcsbFvBlockFactory/BlockManager/AnnotationTrackManager";
import {ExternalTrackBuilderInterface} from "../FeatureTools/ExternalTrackBuilderInterface";
import {PolymerEntityInstanceInterface} from "../DataCollectors/PolymerEntityInstancesCollector";
import {
    TrackManagerInterface
} from "../../RcsbFvWeb/RcsbFvFactories/RcsbFvBlockFactory/BlockManager/TrackManagerInterface";

export type IncreaseAnnotationValueType = (feature:{type:string; targetId:string; positionKey:string; d:Feature; p:FeaturePositionGaps;})=>number;
export interface AnnotationProcessingInterface {
    getAnnotationValue?:IncreaseAnnotationValueType;
    computeAnnotationValue?:(annotationTracks: Map<string, TrackManagerInterface>)=>void;
    addTrackElementCallback?:IncreaseAnnotationValueType;
}

export interface CommonAnnotationInterface {
    rcsbContext?:Partial<PolymerEntityInstanceInterface>;
    annotationProcessing?: AnnotationProcessingInterface;
    externalTrackBuilder?: ExternalTrackBuilderInterface;
    annotationGenerator?(annotations: Array<AnnotationFeatures>): Promise<Array<AnnotationFeatures>>;
    annotationFilter?(annotations: Array<AnnotationFeatures>): Promise<Array<AnnotationFeatures>>;
    titleSuffix?(ann: AnnotationFeatures, d: Feature): Promise<string|undefined>;
    trackTitle?(ann: AnnotationFeatures, d: Feature): Promise<string|undefined>;
    typeSuffix?(ann: AnnotationFeatures, d: Feature): Promise<string|undefined>;
}

export interface AnnotationsCollectConfig extends QueryAnnotationsArgs, CommonAnnotationInterface {
}

export interface CollectGroupAnnotationsInterface extends QueryGroup_AnnotationsArgs, CommonAnnotationInterface {
}

export type AnnotationRequestContext = Partial<AnnotationsCollectConfig & CollectGroupAnnotationsInterface>;

export interface AnnotationCollectorInterface {
    collect(requestConfig: AnnotationsCollectConfig | CollectGroupAnnotationsInterface): Promise<Array<AnnotationFeatures>>;
    getAnnotationFeatures(): Promise<Array<AnnotationFeatures>>;
    getFeatures(): Promise<Array<Feature>>;
}