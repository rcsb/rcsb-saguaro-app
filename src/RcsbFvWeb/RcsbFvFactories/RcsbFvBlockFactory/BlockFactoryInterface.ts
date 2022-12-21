import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {TrackFactoryInterface} from "../RcsbFvTrackFactory/TrackFactoryInterface";

export interface BlockFactoryInterface<T extends any[], S extends any[]> {
    readonly trackFactory: TrackFactoryInterface<S>;
    readonly trackConfigModifier: (...args:S) => Promise<Partial<RcsbFvRowConfigInterface>>;
    getBlock(...args: T): Promise<RcsbFvRowConfigInterface[]>;
}