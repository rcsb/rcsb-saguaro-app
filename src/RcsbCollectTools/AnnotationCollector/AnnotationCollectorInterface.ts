import {
    AnnotationFeatures,
    Feature, FeaturePosition,
    QueryAnnotationsArgs,
    QueryGroup_AnnotationsArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {ExternalTrackBuilderInterface} from "../FeatureTools/ExternalTrackBuilderInterface";
import {PolymerEntityInstanceInterface} from "../DataCollectors/PolymerEntityInstancesCollector";

import {
    AnnotationProcessingInterface
} from "../../RcsbFvWeb/RcsbFvFactories/RcsbFvBlockFactory/AnnotationBlockManager/TrackManagerInterface";

export interface CommonAnnotationInterface {
    rcsbContext?:Partial<PolymerEntityInstanceInterface>;
    annotationProcessing?: AnnotationProcessingInterface;
    externalTrackBuilder?: ExternalTrackBuilderInterface;
    annotationGenerator?(annotations: AnnotationFeatures[]): Promise<AnnotationFeatures[]>;
    annotationFilter?(annotations: AnnotationFeatures[]): Promise<AnnotationFeatures[]>;
    titleSuffix?(ann: AnnotationFeatures, d: Feature): Promise<string|undefined>;
    trackTitle?(ann: AnnotationFeatures, d: Feature): Promise<string|undefined>;
    typeSuffix?(ann: AnnotationFeatures, d: Feature): Promise<string|undefined>;
}

export interface CollectAnnotationsInterface extends QueryAnnotationsArgs, CommonAnnotationInterface {
}

export interface CollectGroupAnnotationsInterface extends QueryGroup_AnnotationsArgs, CommonAnnotationInterface {
}

export type AnnotationRequestContext = Partial<CollectAnnotationsInterface & CollectGroupAnnotationsInterface>;

export interface AnnotationCollectorInterface {
    collect(requestConfig: CollectAnnotationsInterface | CollectGroupAnnotationsInterface): Promise<AnnotationFeatures[]>;
    getAnnotationFeatures(): Promise<AnnotationFeatures[]>;
    getFeatures(): Promise<Feature[]>;
}