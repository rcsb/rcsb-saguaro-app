import {RcsbFvLink} from "@rcsb/rcsb-saguaro";

export interface TrackTitleFactoryInterface<T extends any[]> {
    getTrackTitle(...args: T): Promise<string | RcsbFvLink>;
    getTrackTitlePrefix(...args: T): Promise<string>;
    getTrackTitleFlagColor(...args: T): Promise<string>;
}