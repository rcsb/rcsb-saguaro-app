import {
    RcsbFvDisplayConfigInterface,
    RcsbFvDisplayTypes,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from 'rcsb-saguaro';

import {AlignedRegion, AlignmentResponse, QueryAlignmentArgs, TargetAlignment} from "../../RcsbGraphQL/Types/GqlTypes";
import {RequestAlignmentInterface} from "../../RcsbGraphQL/RcsbQueryAlignment";
import {RcsbFvQuery} from "../../RcsbGraphQL/RcsbFvQuery";

interface CollectAlignmentInterface extends QueryAlignmentArgs {
    filterByTargetContains?:string;
    dynamicDisplay?: boolean;
}

export interface SequenceCollectorDataInterface {
    sequence: Array<RcsbFvRowConfigInterface>;
    alignment: Array<RcsbFvRowConfigInterface>;
}

interface BuildAlignementsInterface {
    targetAlignmentList: Array<TargetAlignment>;
    querySequence: string;
    filterByTargetContains?:string;
}

export class SequenceCollector {

    private rcsbFvQuery: RcsbFvQuery = new RcsbFvQuery();
    private seqeunceConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private alignmentsConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private sequenceLength: number;
    private targets: Array<string> = new Array<string>();
    private finished: boolean = false;
    private dynamicDisplay: boolean = false;

    public collect(requestConfig: CollectAlignmentInterface): Promise<SequenceCollectorDataInterface> {
        if(requestConfig.dynamicDisplay)
            this.dynamicDisplay = true;
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
            return this.buildAlignments({targetAlignmentList: alignmentData, querySequence: querySequence, filterByTargetContains:requestConfig.filterByTargetContains});
         }).catch(error=>{
             console.log(error);
             return error;
         });
    }

    public getLength(): number{
        return this.sequenceLength;
    }

    private buildAlignments(alignmentData: BuildAlignementsInterface): SequenceCollectorDataInterface {
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
        alignmentData.targetAlignmentList.forEach(targetAlignment => {
            if(alignmentData.filterByTargetContains != null && !targetAlignment.target_id.includes(alignmentData.filterByTargetContains))
                return;
            if(targetAlignment.target_sequence == null)
                return;
            this.targets.push(targetAlignment.target_id);
            const targetSequence = targetAlignment.target_sequence;
            const sequenceData: Array<RcsbFvTrackDataElementInterface> = [];
            const alignedBlocks: Array<RcsbFvTrackDataElementInterface> = [];
            const mismatchData: Array<RcsbFvTrackDataElementInterface> = [];
            let next: number = 0;
            let skipRegion: boolean = false;
            targetAlignment.aligned_regions.forEach(region => {
                next++;
                if(skipRegion){
                    skipRegion = false;
                    return;
                }
                const regionSequence = targetSequence.substring(region.target_begin - 1, region.target_end);
                if(targetAlignment.aligned_regions[next]!=null){
                    const nextRegion: AlignedRegion = targetAlignment.aligned_regions[next];
                    if(nextRegion.target_begin === region.target_end+1){
                        sequenceData.push({
                            begin: region.query_begin,
                            value: regionSequence
                        } as RcsbFvTrackDataElementInterface);
                        const nextRegionSequence = targetSequence.substring(nextRegion.target_begin - 1, nextRegion.target_end);
                        sequenceData.push({
                            begin: nextRegion.query_begin,
                            value: nextRegionSequence
                        } as RcsbFvTrackDataElementInterface);
                        let openBegin = false;
                        if(region.target_begin != 1)
                            openBegin = true;
                        let openEnd = false;
                        if(nextRegion.target_end!=targetSequence.length)
                            openEnd = true;
                        alignedBlocks.push({
                            begin: region.query_begin,
                            end: nextRegion.query_end,
                            openBegin:openBegin,
                            openEnd:openEnd,
                            gaps:[{begin:region.query_end, end:nextRegion.query_begin}],
                            type: "ALIGNED_BLOCK"
                        } as RcsbFvTrackDataElementInterface);
                        findMismatch(regionSequence, alignmentData.querySequence.substring(region.query_begin - 1, region.query_end),).forEach(m => {
                            mismatchData.push({
                                begin: (m + region.query_begin),
                                type: "MISMATCH"
                            } as RcsbFvTrackDataElementInterface);
                        });
                        findMismatch(nextRegionSequence, alignmentData.querySequence.substring(nextRegion.query_begin - 1, nextRegion.query_end),).forEach(m => {
                            mismatchData.push({
                                begin: (m + nextRegion.query_begin),
                                type: "MISMATCH"
                            } as RcsbFvTrackDataElementInterface);
                        });
                        skipRegion = true;
                        return;
                    }
                }
                sequenceData.push({
                    begin: region.query_begin,
                    value: regionSequence
                } as RcsbFvTrackDataElementInterface);
                let openBegin = false;
                if(region.target_begin != 1)
                    openBegin = true;
                let openEnd = false;
                if(region.target_end!=targetSequence.length)
                    openEnd = true;
                alignedBlocks.push({
                    begin: region.query_begin,
                    end: region.query_end,
                    openBegin:openBegin,
                    openEnd:openEnd,
                    type: "ALIGNED_BLOCK"
                } as RcsbFvTrackDataElementInterface);
                findMismatch(regionSequence, alignmentData.querySequence.substring(region.query_begin - 1, region.query_end),).forEach(m => {
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
                dynamicDisplay: this.dynamicDisplay
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
        this.finished = true;
        return { sequence: this.seqeunceConfigData, alignment:this.alignmentsConfigData};
    }

    public getTargets():Promise<Array<string>> {

        return new Promise<Array<string>>((resolve,reject)=>{
            const recursive = ()=>{
                if(this.finished){
                    resolve(this.targets);
                }else{
                    window.setTimeout(()=>{
                        recursive();
                    },1000);
                }
            };
            recursive();
        });
    }
}