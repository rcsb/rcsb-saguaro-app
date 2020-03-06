import {
    RcsbFvDisplayConfigInterface,
    RcsbFvDisplayTypes,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from 'rcsb-saguaro';

import {AlignmentResponse, TargetAlignment} from "../../RcsbGraphQL/Types/GqlTypes";
import {RequestAlignmentInterface} from "../../RcsbGraphQL/RcsbQueryAlignment";
import {RcsbFvQuery} from "../../RcsbGraphQL/RcsbFvQuery";

interface CollectAlignmentInterface{
    queryId: string;
    from: string;
    to: string;
}

export interface SequenceCollectorDataInterface {
    sequence: Array<RcsbFvRowConfigInterface>;
    alignment: Array<RcsbFvRowConfigInterface>;
}

export class SequenceCollector {

    private rcsbFvQuery: RcsbFvQuery = new RcsbFvQuery();
    private seqeunceConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private alignmentsConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private sequenceLength: number;

    public collect(requestConfig: CollectAlignmentInterface): Promise<SequenceCollectorDataInterface> {
         return this.rcsbFvQuery.requestAlignment({
            queryId: requestConfig.queryId,
            from: requestConfig.from,
            to: requestConfig.to
        } as RequestAlignmentInterface).then(result => {
            this.sequenceLength = result.query_sequence.length;
             const data: AlignmentResponse = result;
             const querySequence: string = data.query_sequence;
             const alignmentData: Array<TargetAlignment> = data.target_alignment;
             const track: RcsbFvRowConfigInterface = {
                 trackId: "mainSequenceTrack_" + requestConfig.queryId,
                 displayType: RcsbFvDisplayTypes.SEQUENCE,
                 trackColor: "#F9F9F9",
                 displayColor: "#000000",
                 rowTitle: requestConfig.queryId,
                 trackData: [{begin: 1, value: result.query_sequence}]
             };
             this.seqeunceConfigData.push(track);
             return this.buildAlignments(alignmentData, querySequence);
         }).catch(error=>{
             console.log(error);
             return error;
         });
    }

    public getLength(): number{
        return this.sequenceLength;
    }

    private buildAlignments(targetAlignmentList: Array<TargetAlignment>, querySequence: string): SequenceCollectorDataInterface {
        const findMismatch = (seqA: string, seqB: string) => {
            const out = [];
            if (seqA.length === seqB.length) {
                for (let i = 0; i < seqA.length; i++) {
                    if (seqA.charAt(i) !== seqB.charAt(i)) {
                        out.push(i);
                    }
                }
            }
            return out;
        };
        targetAlignmentList.forEach(targetAlignment => {
            const targetSequence = targetAlignment.target_sequence;
            const sequenceData: Array<RcsbFvTrackDataElementInterface> = [];
            const alignedBlocks: Array<RcsbFvTrackDataElementInterface> = [];
            const mismatchData: Array<RcsbFvTrackDataElementInterface> = [];
            targetAlignment.aligned_regions.forEach(region => {
                const regionSequence = targetSequence.substring(region.target_begin - 1, region.target_end);
                sequenceData.push({
                    begin: region.query_begin,
                    value: regionSequence
                } as RcsbFvTrackDataElementInterface);
                alignedBlocks.push({
                    begin: region.query_begin,
                    end: region.query_end,
                    type: "ALIGNED_BLOCK"
                } as RcsbFvTrackDataElementInterface);
                findMismatch(regionSequence, querySequence.substring(region.query_begin - 1, region.query_end),).forEach(m => {
                    mismatchData.push({
                        begin: (m + region.query_begin),
                        type: "MISMATCH"
                    } as RcsbFvTrackDataElementInterface);
                });
            });
            const sequenceDisplay: RcsbFvDisplayConfigInterface = {
                displayType: RcsbFvDisplayTypes.SEQUENCE,
                displayColor: "#000000",
                displayData: sequenceData,
                dynamicDisplay: true
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
            const track: RcsbFvRowConfigInterface = {
                trackId: "targetSequenceTrack_",
                displayType: RcsbFvDisplayTypes.COMPOSITE,
                trackColor: "#F9F9F9",
                rowTitle: targetAlignment.target_id,
                displayConfig: [alignmentDisplay, mismatchDisplay, sequenceDisplay]
            };
            this.alignmentsConfigData.push(track);
        });
        return { sequence: this.seqeunceConfigData, alignment:this.alignmentsConfigData};
    }
}