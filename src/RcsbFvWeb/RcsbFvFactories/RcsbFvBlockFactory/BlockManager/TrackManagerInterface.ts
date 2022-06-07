import {RcsbAnnotationConfigInterface} from "../../../../RcsbAnnotationConfig/AnnotationConfigInterface";
import {Feature, SequenceReference, Source} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    AnnotationProcessingInterface
} from "../../../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";

export interface TrackManagerFactoryInterface<T extends any[]> {
    getTrackManager(...args: T): TrackManagerInterface;
}

export interface TrackManagerInterface {
    getTrackId(): string;
    getConfig(): RcsbAnnotationConfigInterface;
    getRange(): {min:number;max:number};
    addFeature(ann:{reference: SequenceReference | undefined, queryId: string, source: Source, targetId:string, feature: Feature}, annotationProcessing?:AnnotationProcessingInterface): void;
    size(): number;
    forEach(f:(ann:RcsbFvTrackDataElementInterface,loc:string)=>void): void;
    addAll(trackElementsMap: TrackManagerInterface, color?: string ): void;
    getTrackProvenance(): Set<string>;
    values(): Array<RcsbFvTrackDataElementInterface>;
}