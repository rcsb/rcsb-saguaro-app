import {CoreCollectorInterface} from "../CoreCollectorInterface";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {
    Feature,
    QueryAnnotationsArgs,
    QueryGroup_AnnotationsArgs,
    Source
} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {AnnotationTransformer} from "./AnnotationTransformer";
import {ExternalAnnotationTrackBuilderInterface} from "./ExternalAnnotationTrackBuilderInterface";

export type IncreaseAnnotationValueType = (feature:{type:string; targetId:string; positionKey: string; d:Feature;})=>number;
export interface AnnotationProcessingInterface {
    increaseAnnotationValue?:IncreaseAnnotationValueType;
    computeAnnotationValue?:(annotationTracks: Map<string, AnnotationTransformer>)=>void;
}

interface CommonAnnotationInterface {
    annotationProcessing?: AnnotationProcessingInterface;
    externalAnnotationTrackBuilder?: ExternalAnnotationTrackBuilderInterface;
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
    getFeatures(): Promise<Array<Feature>>;
    getAnnotationConfigData(): Promise<Array<RcsbFvRowConfigInterface>>;
}