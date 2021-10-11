import {CoreCollectorInterface} from "../CoreCollectorInterface";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {
    AnnotationFeatures,
    Feature,
    QueryAnnotationsArgs,
    QueryGroup_AnnotationsArgs,
    Source
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {AnnotationTrack, FeaturePositionGaps} from "./AnnotationTrack";
import {ExternalTrackBuilderInterface} from "../FeatureTools/ExternalTrackBuilderInterface";

export type IncreaseAnnotationValueType = (feature:{type:string; targetId:string; positionKey:string; d:Feature; p:FeaturePositionGaps;})=>number;
export interface AnnotationProcessingInterface {
    getAnnotationValue?:IncreaseAnnotationValueType;
    computeAnnotationValue?:(annotationTracks: Map<string, AnnotationTrack>)=>void;
    addTrackElementCallback?:IncreaseAnnotationValueType;
}

interface CommonAnnotationInterface {
    annotationProcessing?: AnnotationProcessingInterface;
    externalAnnotationTrackBuilder?: ExternalTrackBuilderInterface;
}

export interface CollectAnnotationsInterface extends QueryAnnotationsArgs, CommonAnnotationInterface {
    addTargetInTitle?: Set<Source>;
    collectSwissModel?: boolean;
}

export interface CollectGroupAnnotationsInterface extends QueryGroup_AnnotationsArgs, CommonAnnotationInterface {

}

export type AnnotationCollectConfig = Partial<CollectAnnotationsInterface & CollectGroupAnnotationsInterface>;

export interface AnnotationCollectorInterface extends CoreCollectorInterface {
    collect(requestConfig: CollectAnnotationsInterface | CollectGroupAnnotationsInterface): Promise<Array<RcsbFvRowConfigInterface>>;
    getAnnotationConfigData(): Promise<Array<RcsbFvRowConfigInterface>>;
    //TODO this two methods are redundant Array<Feature> can be collected from Array<AnnotationFeatures>
    getAnnotationFeatures(): Promise<Array<AnnotationFeatures>>
    getFeatures(): Promise<Array<Feature>>;
}