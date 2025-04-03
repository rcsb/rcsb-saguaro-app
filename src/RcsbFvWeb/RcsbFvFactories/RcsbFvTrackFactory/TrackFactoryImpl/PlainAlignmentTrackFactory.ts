import {
    RcsbFvColorGradient,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro/lib/RcsbDataManager/RcsbDataManager";
import {
    RcsbFvDisplayConfigInterface,
    RcsbFvRowConfigInterface
} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbFvDisplayTypes} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {
    AlignedRegions,
    TargetAlignments
} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    PolymerEntityInstanceTranslate,
    AlignmentContextInterface
} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {SequenceTrackFactory} from "./SequenceTrackFactory";
import {TrackFactoryInterface} from "../TrackFactoryInterface";
import {AlignmentCollectConfig} from "../../../../RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface";
import {range} from "lodash";
import {TrackTitleFactoryInterface} from "../TrackTitleFactoryInterface";
import {AlignmentTrackTitleFactory} from "../TrackTitleFactoryImpl/AlignmentTrackTitleFactory";
import {TrackUtils} from "./Helper/TrackUtils";
import {Assertions} from "../../../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;
import {RcsbFvTrackDataAnnotationInterface} from "../RcsbFvTrackDataAnnotationInterface";

export type AlignmentRequestContextType = AlignmentCollectConfig & {querySequence?:string;};

export class PlainAlignmentTrackFactory implements TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignments]> {

    private readonly sequenceTrackFactory: SequenceTrackFactory;
    private readonly trackTitleFactory: TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignments]>;

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate) {
        this.sequenceTrackFactory = new SequenceTrackFactory(entityInstanceTranslator);
        this.trackTitleFactory = new AlignmentTrackTitleFactory(entityInstanceTranslator);
    }

    public async getTrack(
        alignmentRequestContext: AlignmentRequestContextType,
        targetAlignment: TargetAlignments,
        alignedRegionToTrackElementList?: (region:AlignedRegions, alignmentContext: AlignmentContextInterface)=>Array<RcsbFvTrackDataElementInterface>,
        alignmentColor?:RcsbFvColorGradient
    ): Promise<RcsbFvRowConfigInterface> {

        const {alignedBlocks, mismatchData, sequenceData} = this.getAlignmentTrackConfiguration(
            alignmentRequestContext,
            targetAlignment,
            alignedRegionToTrackElementList ?? this.alignedRegionToTrackElementList.bind(this)
        );
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
            displayType: RcsbFvDisplayTypes.BLOCK_AREA,
            displayColor: alignmentColor ?? {
                colors: ["#dcdcdc","#c7c7ff"],
                thresholds: [50]
            },
            displayData: alignedBlocks
        };
        return {
            trackId: "targetSequenceTrack_"+targetAlignment.target_id,
            displayType: RcsbFvDisplayTypes.COMPOSITE,
            overlap: true,
            trackColor: "#F9F9F9",
            rowTitle: await this.trackTitleFactory.getTrackTitle(alignmentRequestContext,targetAlignment),
            fitTitleWidth: alignmentRequestContext.fitTitleWidth,
            titleFlagColor: await this.trackTitleFactory.getTrackTitleFlagColor(alignmentRequestContext,targetAlignment),
            displayConfig: [alignmentDisplay, mismatchDisplay, sequenceDisplay]
        };

    }

    public getAlignmentTrackConfiguration(

        alignmentQueryContext: AlignmentRequestContextType,
        targetAlignment: TargetAlignments,
        alignedRegionToTrackElementList: (region:AlignedRegions,alignmentContext: AlignmentContextInterface)=>Array<RcsbFvTrackDataElementInterface>

    ): {alignedBlocks: Array<RcsbFvTrackDataElementInterface>; mismatchData: Array<RcsbFvTrackDataElementInterface>; sequenceData: Array<RcsbFvTrackDataElementInterface>;} {

        const alignedBlocks: Array<RcsbFvTrackDataElementInterface> = [];
        const mismatchData: Array<RcsbFvTrackDataElementInterface> = [];
        const targetSequence = targetAlignment.target_sequence;
        const sequenceData: Array<RcsbFvTrackDataElementInterface> = [];
        const queryId = alignmentQueryContext.queryId ?? alignmentQueryContext.groupId;
        assertDefined(queryId), assertDefined(targetAlignment.target_id);
        const alignmentContext: AlignmentContextInterface = {
            queryId,
            targetId: targetAlignment.target_id,
            from: alignmentQueryContext.from,
            to: alignmentQueryContext.to,
            targetSequenceLength: targetAlignment.target_sequence?.length,
            querySequenceLength: alignmentQueryContext.querySequence?.length
        };
        targetAlignment.aligned_regions?.forEach(region => {
            if(!region?.target_begin || !region?.target_end )
                return;
            const regionSequence = targetSequence?.substring(region.target_begin - 1, region.target_end);
            if(regionSequence)
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

            if(regionSequence && alignmentQueryContext.querySequence)
                findMismatch(regionSequence, alignmentQueryContext.querySequence.substring(region.query_begin - 1, region.query_end)).forEach(m => {
                    if(alignmentQueryContext.querySequence && targetAlignment.target_id && alignmentContext.to)
                        mismatchData.push(this.sequenceTrackFactory.addAuthorResIds({
                            begin: (m + region.query_begin),
                            oriBegin: (m + region.target_begin),
                            sourceId: targetAlignment.target_id,
                            source: TrackUtils.transformSourceFromTarget(alignmentContext.targetId,alignmentContext.to),
                            provenanceName: TrackUtils.getProvenanceConfigFormTarget(alignmentContext.targetId,alignmentContext.to).name,
                            provenanceColor: TrackUtils.getProvenanceConfigFormTarget(alignmentContext.targetId,alignmentContext.to).color,
                            type: "MISMATCH",
                            title: "MISMATCH"
                        }, alignmentContext));
                });
        });
        return {alignedBlocks, mismatchData, sequenceData};
    }

    public alignedRegionToTrackElementList(region: AlignedRegions, alignmentContext: AlignmentContextInterface):  Array<RcsbFvTrackDataElementInterface>{
        let openBegin = false;
        if (region.target_begin != 1)
            openBegin = true;
        let openEnd = false;
        if (region.target_end != alignmentContext.targetSequenceLength && alignmentContext.querySequenceLength)
            openEnd = true;

        return range(region.query_begin,region.query_end+1).map((p,n)=>{
            assertDefined(alignmentContext.to);
            return this.addAuthorResIds({
                begin: p,
                oriBegin: region.target_begin+n,
                sourceId: alignmentContext.targetId,
                source: TrackUtils.transformSourceFromTarget(alignmentContext.targetId,alignmentContext.to),
                provenanceName: TrackUtils.getProvenanceConfigFormTarget(alignmentContext.targetId,alignmentContext.to).name,
                provenanceColor: TrackUtils.getProvenanceConfigFormTarget(alignmentContext.targetId,alignmentContext.to).color,
                openBegin: openBegin,
                openEnd: openEnd,
                type: "ALIGNED_BLOCK",
                title: "ALIGNED REGION",
                value:100
            }, alignmentContext)
        });

    }

    public addAuthorResIds(e:RcsbFvTrackDataAnnotationInterface, alignmentContext:AlignmentContextInterface):RcsbFvTrackDataElementInterface {
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
