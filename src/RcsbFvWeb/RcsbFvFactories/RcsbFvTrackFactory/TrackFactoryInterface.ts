import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {AlignmentCollectConfig} from "../../../RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface";


export type AlignmentRequestContextType = AlignmentCollectConfig & {
    querySequence?:string;
};

export interface TrackFactoryInterface<T extends any[]> {
    getTrack(...args: T): Promise<RcsbFvRowConfigInterface>;
}