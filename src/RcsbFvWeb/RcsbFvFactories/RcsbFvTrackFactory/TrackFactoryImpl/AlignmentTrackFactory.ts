import {
    RcsbFvDisplayConfigInterface,
    RcsbFvRowConfigInterface
} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import { RcsbFvDisplayTypes } from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import { RcsbFvTrackDataElementInterface } from "@rcsb/rcsb-saguaro/lib/RcsbDataManager/RcsbDataManager";
import {
    AlignedRegions,
    TargetAlignments
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
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
import {TrackUtils} from "./Helper/TrackUtils";
import {Assertions} from "../../../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;

export type AlignmentRequestContextType = AlignmentCollectConfig & {
    querySequence?:string;
};

export class AlignmentTrackFactory implements TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignments]> {

    private readonly sequenceTrackFactory: SequenceTrackFactory;
    private readonly trackTitleFactory: TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignments]>;

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate, trackTitleFactory?: TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignments]>) {
        this.sequenceTrackFactory = new SequenceTrackFactory(entityInstanceTranslator);
        this.trackTitleFactory = trackTitleFactory ?? new AlignmentTrackTitleFactory(entityInstanceTranslator);
    }

    public async getTrack(alignmentRequestContext: AlignmentRequestContextType, targetAlignment: TargetAlignments, alignedRegionToTrackElementList?: (region:AlignedRegions, alignmentContext: AlignmentContextInterface)=>Array<RcsbFvTrackDataElementInterface>): Promise<RcsbFvRowConfigInterface> {
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
            overlap: true,
            trackColor: "#F9F9F9",
            rowPrefix: await this.trackTitleFactory.getTrackTitlePrefix(alignmentRequestContext,targetAlignment),
            rowTitle: await this.trackTitleFactory.getTrackTitle(alignmentRequestContext,targetAlignment),
            fitTitleWidth: alignmentRequestContext.fitTitleWidth,
            titleFlagColor: await this.trackTitleFactory.getTrackTitleFlagColor(alignmentRequestContext,targetAlignment),
            displayConfig: [alignmentDisplay, mismatchDisplay, sequenceDisplay]
        };

    }

    private getAlignmentTrackConfiguration(

        alignmentQueryContext: AlignmentRequestContextType,
        targetAlignment: TargetAlignments,
        alignedRegionToTrackElementList: (region:AlignedRegions,alignmentContext: AlignmentContextInterface)=>Array<RcsbFvTrackDataElementInterface>

    ): {alignedBlocks: Array<RcsbFvTrackDataElementInterface>; mismatchData: Array<RcsbFvTrackDataElementInterface>; sequenceData: Array<RcsbFvTrackDataElementInterface>;} {

        assertDefined(alignmentQueryContext.queryId), assertDefined(targetAlignment.target_id);
        const alignedBlocks: Array<RcsbFvTrackDataElementInterface> = [];
        const mismatchData: Array<RcsbFvTrackDataElementInterface> = [];
        const targetSequence = targetAlignment.target_sequence;
        const sequenceData: Array<RcsbFvTrackDataElementInterface> = [];
        const alignmentContext: AlignmentContextInterface = {
            queryId: alignmentQueryContext.queryId,
            targetId: targetAlignment.target_id,
            from: alignmentQueryContext.from,
            to: alignmentQueryContext.to,
            targetSequenceLength: targetAlignment.target_sequence?.length,
            querySequenceLength: alignmentQueryContext.querySequence?.length
        };
        targetAlignment.aligned_regions?.forEach(region => {
            assertDefined(region);
            const regionSequence = targetSequence && region.target_begin && region.target_end ? targetSequence.substring(region.target_begin - 1, region.target_end) : "";
            this.sequenceTrackFactory.buildSequenceData({
                ...alignmentContext,
                sequence: regionSequence,
                begin: region.query_begin,
                oriBegin: region?.target_begin
            }, "to").forEach(sd=>{
                sequenceData.push(sd);
            });

            alignedRegionToTrackElementList(region, {
                ...alignmentContext,
                targetSequenceLength: alignmentContext.targetSequenceLength ?? targetAlignment.target_sequence?.length
            }).forEach(r=>{
                alignedBlocks.push(r);
            })

            if(alignmentQueryContext.querySequence)
                findMismatch(regionSequence, alignmentQueryContext.querySequence.substring(region.query_begin - 1, region.query_end)).forEach(m => {
                    assertDefined(alignmentContext.to), assertDefined(alignmentQueryContext.to);
                    mismatchData.push(this.sequenceTrackFactory.addAuthorResIds({
                        begin: (m + region.query_begin),
                        oriBegin: (m + region.target_begin),
                        sourceId: targetAlignment.target_id ?? undefined,
                        source: TrackUtils.transformSourceFromTarget(alignmentContext.targetId, alignmentContext.to),
                        provenanceName: TrackUtils.getProvenanceConfigFormTarget(alignmentContext.targetId, alignmentQueryContext.to).name,
                        provenanceColor: TrackUtils.getProvenanceConfigFormTarget(alignmentContext.targetId, alignmentQueryContext.to).color,
                        type: "MISMATCH",
                        title: "MISMATCH"
                    }, alignmentContext));
                });
        });
        FeatureTools.mergeBlocks(alignedBlocks);
        return {alignedBlocks, mismatchData, sequenceData};
    }

    public alignedRegionToTrackElementList(region: AlignedRegions, alignmentContext: AlignmentContextInterface):  Array<RcsbFvTrackDataElementInterface>{
        let openBegin = false;
        if (region.target_begin != 1)
            openBegin = true;
        let openEnd = false;
        if (alignmentContext.targetSequenceLength && region.target_end != alignmentContext.targetSequenceLength)
            openEnd = true;

        assertDefined(alignmentContext.to)
        return [this.sequenceTrackFactory.addAuthorResIds({
            begin: region.query_begin,
            end: region.query_end,
            oriBegin: region.target_begin,
            oriEnd: region.target_end,
            sourceId: alignmentContext.targetId,
            source: TrackUtils.transformSourceFromTarget(alignmentContext.targetId, alignmentContext.to),
            provenanceName: TrackUtils.getProvenanceConfigFormTarget(alignmentContext.targetId,alignmentContext.to).name,
            provenanceColor: TrackUtils.getProvenanceConfigFormTarget(alignmentContext.targetId,alignmentContext.to).color,
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
    }else{
        console.error("Find alignment missmatch failed. Sequence regions of different length")
    }
    return out;
}
