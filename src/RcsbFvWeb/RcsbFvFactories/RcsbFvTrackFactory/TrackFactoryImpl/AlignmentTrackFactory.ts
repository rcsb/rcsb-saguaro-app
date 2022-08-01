import {
    RcsbFvDisplayConfigInterface,
    RcsbFvDisplayTypes,
    RcsbFvLink,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import {TagDelimiter} from "../../../../RcsbUtils/Helpers/TagDelimiter";
import {
    AlignedRegion,
    TargetAlignment
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbAnnotationConstants} from "../../../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {
    PolymerEntityInstanceTranslate,
    AlignmentContextInterface
} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {FeatureTools} from "../../../../RcsbCollectTools/FeatureTools/FeatureTools";
import {SequenceTrackFactory} from "./SequenceTrackFactory";
import {TrackFactoryInterface} from "../TrackFactoryInterface";
import {AlignmentCollectConfig} from "../../../../RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface";
import {TrackTitleFactoryInterface} from "../TrackTitleFactoryInterface";
import {AlignmentTrackTitleFactory} from "../TrackTitleFactoryImpl/AlignmentTrackTitleFactory";

export type AlignmentRequestContextType = AlignmentCollectConfig & {
    querySequence?:string;
};

export class AlignmentTrackFactory implements TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment]> {

    private readonly sequenceTrackFactory: SequenceTrackFactory;
    private readonly entityInstanceTranslator: PolymerEntityInstanceTranslate | undefined = undefined;
    private readonly trackTitleFactory: TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignment]>;

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate, trackTitleFactory?: TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignment]>) {
        this.sequenceTrackFactory = new SequenceTrackFactory(entityInstanceTranslator);
        this.entityInstanceTranslator = entityInstanceTranslator;
        this.trackTitleFactory = trackTitleFactory ?? new AlignmentTrackTitleFactory(entityInstanceTranslator);
    }

    public async getTrack(alignmentRequestContext: AlignmentRequestContextType, targetAlignment: TargetAlignment, alignedRegionToTrackElementList?: (region:AlignedRegion, alignmentContext: AlignmentContextInterface)=>Array<RcsbFvTrackDataElementInterface>): Promise<RcsbFvRowConfigInterface> {
        const {alignedBlocks, mismatchData, sequenceData} = this.getAlignmentTrackConfiguration(alignmentRequestContext, targetAlignment, alignedRegionToTrackElementList ?? this.alignedRegionToTrackElementList.bind(this));
        const sequenceDisplay: RcsbFvDisplayConfigInterface = {
            displayType: RcsbFvDisplayTypes.SEQUENCE,
            displayColor: "#000000",
            displayData: sequenceData
        };
        const mismatchDisplay: RcsbFvDisplayConfigInterface = {
            displayType: RcsbFvDisplayTypes.PIN,
            displayColor: "#FF9999",
            displayData: mismatchData
        };
        const alignmentDisplay: RcsbFvDisplayConfigInterface = {
            displayType: RcsbFvDisplayTypes.BLOCK,
            displayColor: "#9999FF",
            displayData: alignedBlocks
        };
        return {
            trackId: "targetSequenceTrack_"+targetAlignment.target_id,
            displayType: RcsbFvDisplayTypes.COMPOSITE,
            trackColor: "#F9F9F9",
            rowPrefix: await this.buildAlignmentRowTitlePrefix(alignmentRequestContext,targetAlignment),
            rowTitle: await this.buildAlignmentRowTitle(alignmentRequestContext,targetAlignment),
            fitTitleWidth: alignmentRequestContext.fitTitleWidth,
            titleFlagColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
            displayConfig: [alignmentDisplay, mismatchDisplay, sequenceDisplay]
        };

    }

    public async buildAlignmentRowTitle(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<string | RcsbFvLink> {
        return await this.trackTitleFactory.getTrackTitle(alignmentQueryContext,targetAlignment);
    }

    public async buildAlignmentRowTitlePrefix(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<string> {
        return await this.trackTitleFactory.getTrackTitlePrefix(alignmentQueryContext,targetAlignment);
    }

    private getAlignmentTrackConfiguration(

        alignmentQueryContext: AlignmentRequestContextType,
        targetAlignment: TargetAlignment,
        alignedRegionToTrackElementList: (region:AlignedRegion,alignmentContext: AlignmentContextInterface)=>Array<RcsbFvTrackDataElementInterface>

    ): {alignedBlocks: Array<RcsbFvTrackDataElementInterface>; mismatchData: Array<RcsbFvTrackDataElementInterface>; sequenceData: Array<RcsbFvTrackDataElementInterface>;} {

        const alignedBlocks: Array<RcsbFvTrackDataElementInterface> = [];
        const mismatchData: Array<RcsbFvTrackDataElementInterface> = [];
        const targetSequence = targetAlignment.target_sequence;
        const sequenceData: Array<RcsbFvTrackDataElementInterface> = [];
        const alignmentContext: AlignmentContextInterface = {
            queryId: alignmentQueryContext.queryId,
            targetId: targetAlignment.target_id,
            from: alignmentQueryContext.from,
            to: alignmentQueryContext.to,
            targetSequenceLength: targetAlignment.target_sequence.length,
            querySequenceLength: alignmentQueryContext.querySequence?.length
        };
        targetAlignment.aligned_regions.forEach(region => {
            const regionSequence = targetSequence.substring(region.target_begin - 1, region.target_end);
            this.sequenceTrackFactory.buildSequenceData({
                ...alignmentContext,
                sequence: regionSequence,
                begin: region.query_begin,
                oriBegin: region.target_begin
            }, "to").forEach(sd=>{
                sequenceData.push(sd);
            });

            alignedRegionToTrackElementList(region, alignmentContext).forEach(r=>{
                alignedBlocks.push(r);
            })

            if(alignmentQueryContext.querySequence)
                findMismatch(regionSequence, alignmentQueryContext.querySequence.substring(region.query_begin - 1, region.query_end)).forEach(m => {
                    mismatchData.push(this.sequenceTrackFactory.addAuthorResIds({
                        begin: (m + region.query_begin),
                        oriBegin: (m + region.target_begin),
                        sourceId: targetAlignment.target_id,
                        source: alignmentQueryContext.to,
                        provenanceName: RcsbAnnotationConstants.provenanceName.pdb,
                        provenanceColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                        type: "MISMATCH",
                        title: "MISMATCH"
                    }, alignmentContext));
                });
        });
        FeatureTools.mergeBlocks(alignedBlocks);
        return {alignedBlocks, mismatchData, sequenceData};
    }

    public alignedRegionToTrackElementList(region: AlignedRegion, alignmentContext: AlignmentContextInterface):  Array<RcsbFvTrackDataElementInterface>{
        let openBegin = false;
        if (region.target_begin != 1)
            openBegin = true;
        let openEnd = false;
        if (region.target_end != alignmentContext.targetSequenceLength && alignmentContext.querySequenceLength)
            openEnd = true;

        return [this.sequenceTrackFactory.addAuthorResIds({
            begin: region.query_begin,
            end: region.query_end,
            oriBegin: region.target_begin,
            oriEnd: region.target_end,
            sourceId: alignmentContext.targetId,
            source: alignmentContext.to,
            provenanceName: RcsbAnnotationConstants.provenanceName.pdb,
            provenanceColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
            openBegin: openBegin,
            openEnd: openEnd,
            type: "ALIGNED_BLOCK",
            title: "ALIGNED REGION"
        }, alignmentContext)];

    }

    public addAuthorResIds(e:RcsbFvTrackDataElementInterface, alignmentContext:AlignmentContextInterface):RcsbFvTrackDataElementInterface {
        return this.sequenceTrackFactory.addAuthorResIds(e,alignmentContext);
    }

}

function findMismatch(seqA: string, seqB: string): Array<number> {
    const out: Array<number> = [];
    if (seqA.length === seqB.length) {
        for (let i = 0; i < seqA.length; i++) {
            if (seqA.charAt(i) !== seqB.charAt(i)) {
                out.push(i);
            }
        }
    }
    return out;
}
