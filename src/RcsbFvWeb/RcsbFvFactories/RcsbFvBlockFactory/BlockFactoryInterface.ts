import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {TrackFactoryInterface} from "../RcsbFvTrackFactory/TrackFactoryInterface";
import {AlignmentRequestContextType} from "../RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory";
import {TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";

export interface BlockFactoryInterface<T extends any[], S extends any[]> {
    readonly trackFactory: TrackFactoryInterface<S>;
    readonly trackConfigModifier: (...args:S) => Promise<Partial<RcsbFvRowConfigInterface>>;
    getBlock(...args: T): Promise<RcsbFvRowConfigInterface[]>;
}