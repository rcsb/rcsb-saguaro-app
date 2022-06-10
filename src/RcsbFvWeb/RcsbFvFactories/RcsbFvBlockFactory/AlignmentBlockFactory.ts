import {
    AlignmentResponse,
    TargetAlignment
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {AlignmentRequestContextType} from "../RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory";
import {BlockFactoryInterface} from "./BlockFactoryInterface";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {TrackFactoryInterface} from "../RcsbFvTrackFactory/TrackFactoryInterface";

export class AlignmentBlockFactory implements BlockFactoryInterface<[AlignmentRequestContextType, AlignmentResponse],[AlignmentRequestContextType, TargetAlignment]> {

    readonly trackFactory: TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment]>;

    constructor(
        alignmentTrackFactory: TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment]>
    ) {
        this.trackFactory = alignmentTrackFactory;
    }

    async getBlock(alignmentRequestContext: AlignmentRequestContextType, alignmentData: AlignmentResponse): Promise<RcsbFvRowConfigInterface[]> {
        alignmentRequestContext = {...alignmentRequestContext, querySequence: alignmentData.query_sequence};
        return (await Promise.all(alignmentData.target_alignment.map(async alignment=>{
            if (alignmentRequestContext.filterByTargetContains != null && !alignment.target_id.includes(alignmentRequestContext.filterByTargetContains))
                return;
            if (alignment.target_sequence == null)
                return;
           return await this.trackFactory.getTrack(alignmentRequestContext, alignment);
        }))).filter(x=>x!=undefined);
    }

}