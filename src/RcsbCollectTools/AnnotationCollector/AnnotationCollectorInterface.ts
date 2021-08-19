import {CoreCollectorInterface} from "../CoreCollectorInterface";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {
    Feature,
    QueryAnnotationsArgs,
    Source
} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {AnnotationTransformer} from "./AnnotationTransformer";

export type IncreaseAnnotationValueType = (feature:{type:string; targetId:string; positionKey: string; d:Feature;})=>number;
export interface AnnotationProcessingInterface {
    increaseAnnotationValue?:IncreaseAnnotationValueType;
    computeAnnotationValue?:(annotationTracks: Map<string, AnnotationTransformer>)=>void;
}

export interface CollectAnnotationsInterface extends QueryAnnotationsArgs {
    addTargetInTitle?: Set<Source>;
    collectSwissModel?: boolean;
    annotationProcessing?: AnnotationProcessingInterface;
}

export type AnnotationCollectConfig = Partial<CollectAnnotationsInterface>;

export interface AnnotationCollectorInterface extends CoreCollectorInterface {
    collect(requestConfig: CollectAnnotationsInterface): Promise<Array<RcsbFvRowConfigInterface>>;
    getFeatures(): Promise<Array<Feature>>;
    getAnnotationConfigData(): Promise<Array<RcsbFvRowConfigInterface>>;
}