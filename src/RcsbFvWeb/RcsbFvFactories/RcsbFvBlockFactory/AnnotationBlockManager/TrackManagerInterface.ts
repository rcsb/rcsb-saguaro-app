import {RcsbAnnotationConfigInterface} from "../../../../RcsbAnnotationConfig/AnnotationConfigInterface";
import {
    Feature,
    FeaturePosition,
    SequenceReference,
    Source
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";

import {RcsbFvTrackDataElementGapInterface, RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";

export interface TrackManagerFactoryInterface<T extends any[]> {
    getTrackManager(...args: T): TrackManagerInterface;
}

export interface TrackManagerInterface {
    getId(): string;
    getConfig(): RcsbAnnotationConfigInterface | undefined;
    getRange(): {min:number;max:number};
    addFeature(ann:{reference: SequenceReference | undefined, queryId: string, source: Source, targetId:string, feature: Feature}, annotationProcessing?:AnnotationProcessingInterface): void;
    size(): number;
    forEach(f:(ann:RcsbFvTrackDataElementInterface,loc:string)=>void): void;
    addAll(trackElementsMap: TrackManagerInterface, color?: string ): void;
    getTrackProvenance(): Set<string>;
    values(): RcsbFvTrackDataElementInterface[];
}
export interface AnnotationProcessingInterface {
    getAnnotationValue?:IncreaseAnnotationValueType;
    computeAnnotationValue?:(annotationTracks: Map<string, TrackManagerInterface>)=>void;
    addTrackElementCallback?:IncreaseAnnotationValueType;
}
export type IncreaseAnnotationValueType = (feature:{type:string; targetId:string; positionKey:string; d:Feature; p:FeaturePositionGaps;})=>number;
export interface FeaturePositionGaps extends FeaturePosition {
    gaps?: RcsbFvTrackDataElementGapInterface[];
}

