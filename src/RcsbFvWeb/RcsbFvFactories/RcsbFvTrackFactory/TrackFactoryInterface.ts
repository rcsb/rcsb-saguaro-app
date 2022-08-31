import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";

export interface TrackFactoryInterface<T extends any[]> {
    getTrack(...args: T): Promise<RcsbFvRowConfigInterface>;
}