import {
    AlignmentResponse,
    TargetAlignment
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {AlignmentRequestContextType} from "../RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory";
import {BlockFactoryInterface} from "./BlockFactoryInterface";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {TrackFactoryInterface} from "../RcsbFvTrackFactory/TrackFactoryInterface";

export class AlignmentBlockFactory implements BlockFactoryInterface<[AlignmentRequestContextType, AlignmentResponse],[AlignmentRequestContextType, TargetAlignment, AlignmentResponse]> {

    readonly trackFactory: TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment]>;
    readonly trackConfigModifier?: (alignmentContext: AlignmentRequestContextType, targetAlignment: TargetAlignment, alignmentResponse: AlignmentResponse) => Promise<Partial<RcsbFvRowConfigInterface>>;

    constructor(
        alignmentTrackFactory: TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment]>,
        trackModifier?: (alignmentContext: AlignmentRequestContextType, targetAlignment: TargetAlignment, alignmentResponse: AlignmentResponse) => Promise<Partial<RcsbFvRowConfigInterface>>
    ) {
        this.trackFactory = alignmentTrackFactory;
        this.trackConfigModifier = trackModifier;
    }

    async getBlock(alignmentRequestContext: AlignmentRequestContextType, alignmentData: AlignmentResponse): Promise<RcsbFvRowConfigInterface[]> {
        alignmentRequestContext = {...alignmentRequestContext, querySequence: alignmentData.query_sequence ?? undefined};
        if(!alignmentData.target_alignment)
            return [];
        return (await Promise.all<undefined|RcsbFvRowConfigInterface>(alignmentData.target_alignment.map(async alignment=>{
            if (alignmentRequestContext.filterByTargetContains != null && !alignment?.target_id?.includes(alignmentRequestContext.filterByTargetContains))
                return;
            if (alignment?.target_sequence == null)
                return;
           return {
               ... await this.trackFactory.getTrack(alignmentRequestContext, alignment),
               ... await this.trackConfigModifier?.(alignmentRequestContext,alignment, alignmentData)
           };
        }))).filter((x): x is RcsbFvRowConfigInterface=>x!=undefined);
    }

}