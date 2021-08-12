import {CoreCollectorInterface} from "../CoreCollectorInterface";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {
    Feature,
    QueryAnnotationsArgs,
    QueryGroup_AnnotationsArgs,
    Source
} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {AnnotationTransformer} from "./AnnotationTransformer";

export interface AnnotationProcessingInterface {
    increaseAnnotationValue?:(feature:{type:string; targetId:string; positionKey: string; d:Feature;})=>number;
    computeAnnotationValue?:(annotationTracks: Map<string, AnnotationTransformer>)=>void;
}

export interface CollectAnnotationsInterface extends QueryAnnotationsArgs {
    addTargetInTitle?: Set<Source>;
    collectSwissModel?: boolean;
    annotationProcessing?: AnnotationProcessingInterface;
}

export interface CollectGroupAnnotationsInterface extends QueryGroup_AnnotationsArgs {
    annotationProcessing?: AnnotationProcessingInterface;
}

export type AnnotationCollectConfig = Partial<CollectAnnotationsInterface & CollectGroupAnnotationsInterface>;

export interface AnnotationCollectorInterface extends CoreCollectorInterface {
    collect(requestConfig: CollectAnnotationsInterface | CollectGroupAnnotationsInterface): Promise<Array<RcsbFvRowConfigInterface>>;
    getFeatures(): Promise<Array<Feature>>;
    getAnnotationConfigData(): Promise<Array<RcsbFvRowConfigInterface>>;
}