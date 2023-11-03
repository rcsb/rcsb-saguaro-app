import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";

export interface TrackFactoryInterface<T extends any[]> {
    getTrack(...args: T): Promise<RcsbFvRowConfigInterface>;
}