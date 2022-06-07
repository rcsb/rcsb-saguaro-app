import {
    AlignmentResponse,
    AnnotationFeatures,
    TargetAlignment
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {AlignmentRequestContextType} from "../RcsbFvTrackFactory/AlignmentTrackFactory";
import {BlockFactoryInterface} from "./BlockFactoryInterface";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {TrackFactoryInterface} from "../RcsbFvTrackFactory/TrackFactoryInterface";

export class AlignmentBlockFactory implements BlockFactoryInterface<[AlignmentRequestContextType, AlignmentResponse, Array<AnnotationFeatures>]> {

    private readonly alignmentTrackFactory: TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment, Array<AnnotationFeatures>]> | TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment]>;

    constructor(
        alignmentTrackFactory: TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment, Array<AnnotationFeatures>]> | TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment]>
    ) {

        this.alignmentTrackFactory = alignmentTrackFactory;
    }

    async getBlock(alignmentRequestContext: AlignmentRequestContextType, alignmentData: AlignmentResponse, features?: Array<AnnotationFeatures>): Promise<RcsbFvRowConfigInterface[]> {
        alignmentRequestContext = {...alignmentRequestContext, querySequence: alignmentData.query_sequence};
        return (await Promise.all(alignmentData.target_alignment.map(async alignment=>{
            if (alignmentRequestContext.filterByTargetContains != null && !alignment.target_id.includes(alignmentRequestContext.filterByTargetContains))
                return;
            if (alignment.target_sequence == null)
                return;
           return await this.alignmentTrackFactory.getTrack(alignmentRequestContext, alignment, features);
        }))).filter(x=>x!=undefined);
    }

}