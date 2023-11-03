import {
    AlignmentResponse,
    TargetAlignment
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {AlignmentRequestContextType} from "../RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory";
import {BlockFactoryInterface} from "./BlockFactoryInterface";
import {TrackFactoryInterface} from "../RcsbFvTrackFactory/TrackFactoryInterface";

export class AlignmentBlockFactory implements BlockFactoryInterface<[AlignmentRequestContextType, AlignmentResponse],[AlignmentRequestContextType, TargetAlignment, AlignmentResponse, number]> {

    readonly trackFactory: TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment]>;
    readonly trackConfigModifier?: (alignmentContext: AlignmentRequestContextType, targetAlignment: TargetAlignment, alignmentResponse: AlignmentResponse, indexResponse: number) => Promise<Partial<RcsbFvRowConfigInterface>>;

    constructor(
        alignmentTrackFactory: TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment]>,
        trackModifier?: (alignmentContext: AlignmentRequestContextType, targetAlignment: TargetAlignment, alignmentResponse: AlignmentResponse, indexResponse: number) => Promise<Partial<RcsbFvRowConfigInterface>>
    ) {
        this.trackFactory = alignmentTrackFactory;
        this.trackConfigModifier = trackModifier;
    }

    async getBlock(alignmentRequestContext: AlignmentRequestContextType, alignmentData: AlignmentResponse): Promise<RcsbFvRowConfigInterface[]> {
        alignmentRequestContext = {...alignmentRequestContext, querySequence: alignmentData.query_sequence ?? undefined};
        if(!alignmentData.target_alignment)
            return [];
        return (await Promise.all<undefined|RcsbFvRowConfigInterface>(alignmentData.target_alignment.map(async (alignment, index)=>{
            if (alignmentRequestContext.filterByTargetContains != null && !alignment?.target_id?.includes(alignmentRequestContext.filterByTargetContains))
                return;
            if (alignment?.target_sequence == null)
                return;
           return {
               ... await this.trackFactory.getTrack(alignmentRequestContext, alignment),
               ... await this.trackConfigModifier?.(alignmentRequestContext,alignment, alignmentData, index)
           };
        }))).filter((x): x is RcsbFvRowConfigInterface=>x!=undefined);
    }

}