import {RcsbFvLink} from "@rcsb/rcsb-saguaro";

export interface TrackTitleFactoryInterface<T extends any[]> {
    getTrackTitle(...args: T): Promise<string | RcsbFvLink>;
}