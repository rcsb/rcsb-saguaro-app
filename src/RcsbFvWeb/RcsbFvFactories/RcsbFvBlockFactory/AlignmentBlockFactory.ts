import {
    AlignmentResponse,
    TargetAlignment
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {BlockFactoryInterface} from "./BlockFactoryInterface";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {AlignmentRequestContextType, TrackFactoryInterface} from "../RcsbFvTrackFactory/TrackFactoryInterface";

export class AlignmentBlockFactory implements BlockFactoryInterface<[AlignmentRequestContextType, AlignmentResponse],[AlignmentRequestContextType, TargetAlignment]> {

    readonly trackFactory: TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment]>;
    readonly trackConfigModifier: (alignmentContext: AlignmentRequestContextType, targetAlignment: TargetAlignment) => Promise<Partial<RcsbFvRowConfigInterface>>;

    constructor(
        alignmentTrackFactory: TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment]>,
        trackModifier: (alignmentContext: AlignmentRequestContextType, targetAlignment: TargetAlignment) => Promise<Partial<RcsbFvRowConfigInterface>>
    ) {
        this.trackFactory = alignmentTrackFactory;
        this.trackConfigModifier = trackModifier;
    }

    async getBlock(alignmentRequestContext: AlignmentRequestContextType, alignmentData: AlignmentResponse): Promise<RcsbFvRowConfigInterface[]> {
        alignmentRequestContext = {...alignmentRequestContext, querySequence: alignmentData.query_sequence};
        return (await Promise.all(alignmentData.target_alignment.map(async alignment=>{
            if (alignmentRequestContext.filterByTargetContains != null && !alignment.target_id.includes(alignmentRequestContext.filterByTargetContains))
                return;
            if (alignment.target_sequence == null)
                return;
           return {
               ... await this.trackFactory.getTrack(alignmentRequestContext, alignment),
               ... await this.trackConfigModifier(alignmentRequestContext,alignment)
           };
        }))).filter(x=>x!=undefined);
    }

}