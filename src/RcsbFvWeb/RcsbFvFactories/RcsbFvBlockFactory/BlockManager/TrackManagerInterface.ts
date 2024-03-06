import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro/lib/RcsbDataManager/RcsbDataManager";
import {RcsbAnnotationConfigInterface} from "../../../../RcsbAnnotationConfig/AnnotationConfigInterface";
import {Feature, SequenceReference, AnnotationReference} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    AnnotationProcessingInterface
} from "../../../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {RcsbFvTrackDataAnnotationInterface} from "../../RcsbFvTrackFactory/RcsbFvTrackDataAnnotationInterface";

export interface TrackManagerFactoryInterface<T extends any[]> {
    getTrackManager(...args: T): TrackManagerInterface;
}

export interface TrackManagerInterface {
    getId(): string;
    getConfig(): RcsbAnnotationConfigInterface | undefined;
    getRange(): {min:number;max:number};
    addFeature(ann:{reference: SequenceReference | undefined, queryId: string, source: AnnotationReference, targetId:string, feature: Feature}, annotationProcessing?:AnnotationProcessingInterface): void;
    size(): number;
    forEach(f:(ann:RcsbFvTrackDataAnnotationInterface, loc:string)=>void): void;
    addAll(trackElementsMap: TrackManagerInterface, color?: string ): void;
    getTrackProvenance(): Set<string>;
    values(): Array<RcsbFvTrackDataElementInterface>;
}