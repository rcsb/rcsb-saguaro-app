import {RcsbFvTrackDataElementInterface} from '@bioinsilico/rcsb-saguaro';
import {RcsbFvDisplayTypes} from '@bioinsilico/rcsb-saguaro';
import {RcsbFvRowConfigInterface} from '@bioinsilico/rcsb-saguaro';
import {RcsbFvDisplayConfigInterface} from '@bioinsilico/rcsb-saguaro';

import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";

export class PairwiseAlignmentBuilder {
    private querySeqeunce: string;
    private targetSeqeunce: string;
    private alignmentLength: number;

    constructor(qSeq: string, tSeq: string) {
        this.querySeqeunce = qSeq;
        this.targetSeqeunce = tSeq;
        if(this.querySeqeunce.length != this.targetSeqeunce.length)
            throw "Sequence alignment length mismatch";
        this.alignmentLength = this.querySeqeunce.length;
    }

    getLength():number {
        return this.alignmentLength;
    }

    build(): Array<RcsbFvRowConfigInterface>{
        const qA: Array<string> = this.querySeqeunce.split('');
        const tA: Array<string> = this.targetSeqeunce.split('');

        const alignedBlocks: Array<RcsbFvTrackDataElementInterface> = [];
        const mismatchData: Array<RcsbFvTrackDataElementInterface> = [];
        let start: number = 1;
        qA.forEach((q,i)=>{
            const t: string = tA[i];
            if(q === "-" || t === "-"){
                if(start > 0 && i>start){
                    alignedBlocks.push({
                        begin: start,
                        end: i,
                        provenanceName: RcsbAnnotationConstants.provenanceName.mmseqs,
                        provenanceColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                        type: "ALIGNED_BLOCK",
                        title: "ALIGNED REGION"
                    });
                    start = 0;
                }
            }else if(q!="-" && t!="-" && start == 0){
                start = i+1;
            }
            if(q!="-" && t!="-" && q!=t && start > 0){
                mismatchData.push({
                    begin: i+1,
                    provenanceName: RcsbAnnotationConstants.provenanceName.mmseqs,
                    provenanceColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                    type: "MISMATCH",
                    title: "MISMATCH"
                });
            }
        });
        if(start>0){
            alignedBlocks.push({
                begin: start,
                end: this.alignmentLength,
                provenanceName: RcsbAnnotationConstants.provenanceName.mmseqs,
                provenanceColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                type: "ALIGNED_BLOCK",
                title: "ALIGNED REGION"
            });
        }

        const queryTrack: RcsbFvRowConfigInterface = {
            trackId: "query_sequence",
            displayType: RcsbFvDisplayTypes.SEQUENCE,
            trackColor: "#F9F9F9",
            displayColor: "#000000",
            rowTitle: "QUERY SEQ",
            nonEmptyDisplay: true,
            trackData: [{
                value:this.querySeqeunce,
                begin:1,
            }]
        };

        const targetTrack: RcsbFvRowConfigInterface = {
            trackId: "target_sequence",
            displayType: RcsbFvDisplayTypes.SEQUENCE,
            trackColor: "#F9F9F9",
            displayColor: "#000000",
            rowTitle: "TARGET SEQ",
            nonEmptyDisplay: true,
            trackData: [{
                value:this.targetSeqeunce,
                begin:1,
            }]
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

        const alignmentTrack: RcsbFvRowConfigInterface = {
            trackId: "targetSequenceTrack",
            displayType: RcsbFvDisplayTypes.COMPOSITE,
            trackColor: "#F9F9F9",
            titleFlagColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
            displayConfig: [alignmentDisplay,mismatchDisplay]
        };
        return [queryTrack,alignmentTrack,targetTrack];
    }
}