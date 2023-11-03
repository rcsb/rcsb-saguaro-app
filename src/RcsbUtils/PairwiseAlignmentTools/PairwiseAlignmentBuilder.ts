import {
    RcsbFvDisplayConfigInterface,
    RcsbFvRowConfigInterface
} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro/lib/RcsbDataManager/RcsbDataManager";
import {RcsbFvDisplayTypes} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";

import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {SequenceReference} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {FeatureTools} from "../../RcsbCollectTools/FeatureTools/FeatureTools";
import {
    TrackUtils
} from "../../RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/Helper/TrackUtils";

export interface PairwiseAlignmentInterface{
    querySequence: string;
    targetSequence: string;
    queryAlignment: string;
    targetAlignment: string;
    queryBegin: number;
    queryEnd: number;
    targetBegin: number;
    targetEnd: number;
    targetId: string;
    queryId: string;
    sequenceId: number;
    isQueryExternal: boolean;
    isTargetExternal: boolean;
    pairwiseView?: boolean;
}

const gradient: (x: number[], y: number[], z: number) => number[] = (color1, color2, weight)=>{
    const w1: number = weight;
    const w2: number = 1 - w1;
    return [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)];
};

//TODO This class is not using factories to build PFV row configurations
export class PairwiseAlignmentBuilder {
    private querySequence: string;
    private targetSequence: string;
    private queryAlignment: string;
    private targetAlignment: string;
    private readonly queryBegin: number;
    private readonly targetBegin: number;
    private readonly alignmentLength: number;
    private readonly targetId: string;
    private readonly queryId: string;
    private sequenceId: number;
    private readonly isQueryExternal: boolean;
    private readonly isTargetExternal: boolean;
    private readonly pairwiseView: boolean | undefined;

    constructor(paI: PairwiseAlignmentInterface) {
        this.querySequence = paI.querySequence;
        this.targetSequence = paI.targetSequence;
        this.queryAlignment = paI.queryAlignment;
        this.targetAlignment = paI.targetAlignment;
        this.queryBegin = paI.queryBegin;
        this.targetBegin = paI.targetBegin;
        this.targetId = paI.targetId;
        this.queryId = paI.queryId;
        this.sequenceId = paI.sequenceId;
        this.isQueryExternal = paI.isQueryExternal;
        this.isTargetExternal = paI.isTargetExternal;
        this.pairwiseView = paI.pairwiseView;

        if(this.queryAlignment.length != this.targetAlignment.length)
            throw "Sequence alignments length mismatch";
        if(this.pairwiseView)
            this.alignmentLength = this.queryAlignment.length;
        else
            this.alignmentLength = this.querySequence.length;
    }

    getLength():number {
        return this.alignmentLength;
    }

    buildReferenceAlignment(): Array<RcsbFvRowConfigInterface> {
        const qA: Array<string> = this.queryAlignment.split('');
        const tA: Array<string> = this.targetAlignment.split('');

        const alignedBlocks: Array<RcsbFvTrackDataElementInterface> = [];
        const mismatchData: Array<RcsbFvTrackDataElementInterface> = [];
        const targetSequence: Array<RcsbFvTrackDataElementInterface> = [];
        let currentQueryIndex: number = this.queryBegin;
        let currentTargetIndex: number = this.targetBegin;
        let blockQueryStart: number = this.queryBegin;
        let blockTargetStart: number = this.targetBegin;

        qA.forEach((q,i)=> {
            const t: string = tA[i];
            if( (t === "-" || q === "-")  && blockQueryStart > 0){
                alignedBlocks.push({
                    begin: blockQueryStart,
                    end: (currentQueryIndex-1),
                    oriBegin: blockTargetStart,
                    oriEnd: (currentTargetIndex-1),
                    source: this.isTargetExternal ? RcsbAnnotationConstants.provenanceName.userInput : TrackUtils.transformSourceFromTarget(this.targetId,SequenceReference.PdbEntity),
                    sourceId: this.targetId,
                    provenanceName: RcsbAnnotationConstants.provenanceName.mmseqs,
                    provenanceColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                    type: "ALIGNED_BLOCK",
                    title: "ALIGNED REGION"
                });
                blockQueryStart = 0;
            }
            if(q!="-" && t!="-"){
                targetSequence.push({
                    begin: currentQueryIndex,
                    oriBegin: currentTargetIndex,
                    source: this.isTargetExternal ? RcsbAnnotationConstants.provenanceName.userInput : TrackUtils.transformSourceFromTarget(this.targetId,SequenceReference.PdbEntity),
                    sourceId:this.targetId,
                    provenanceName: TrackUtils.getProvenanceConfigFormTarget(this.targetId,this.targetId as SequenceReference).name,
                    provenanceColor: TrackUtils.getProvenanceConfigFormTarget(this.targetId,this.targetId as SequenceReference).color,
                    value: t,
                    type: "RESIDUE",
                    title: "RESIDUE"
                });
                if(q != t) {
                    mismatchData.push({
                        begin: currentQueryIndex,
                        oriBegin: currentTargetIndex,
                        source: this.isTargetExternal ? RcsbAnnotationConstants.provenanceName.userInput : TrackUtils.transformSourceFromTarget(this.targetId,SequenceReference.PdbEntity),
                        sourceId:this.targetId,
                        provenanceName: RcsbAnnotationConstants.provenanceName.mmseqs,
                        provenanceColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                        type: "MISMATCH",
                        title: "MISMATCH"
                    });
                }
            }
            if(t != "-" && q != "-" && blockQueryStart == 0){
                blockQueryStart = currentQueryIndex;
                blockTargetStart = currentTargetIndex;
            }
            if(q != "-"){
                currentQueryIndex++;
            }
            if(t != "-"){
                currentTargetIndex++;
            }
        });
        if(blockQueryStart > 0){
            alignedBlocks.push({
                begin: blockQueryStart,
                end: (currentQueryIndex-1),
                oriBegin: blockTargetStart,
                oriEnd: (currentTargetIndex-1),
                source: this.isTargetExternal ? RcsbAnnotationConstants.provenanceName.userInput : TrackUtils.transformSourceFromTarget(this.targetId,SequenceReference.PdbEntity),
                sourceId:this.targetId,
                provenanceName: RcsbAnnotationConstants.provenanceName.mmseqs,
                provenanceColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                type: "ALIGNED_BLOCK",
                title: "ALIGNED REGION"
            });
        }
        this.addBlockTerminalTags(alignedBlocks);

        const queryTrack: RcsbFvRowConfigInterface = {
            trackId: "query_sequence",
            displayType: RcsbFvDisplayTypes.SEQUENCE,
            trackColor: "#F9F9F9",
            displayColor: "#000000",
            titleFlagColor: TrackUtils.getProvenanceConfigFormTarget(this.queryId,SequenceReference.PdbEntity).color,
            rowTitle: this.queryId,
            nonEmptyDisplay: true,
            trackData: this.querySequence.split('').map((s,n)=>({
                source: this.isQueryExternal ? RcsbAnnotationConstants.provenanceName.userInput : TrackUtils.transformSourceFromTarget(this.queryId,SequenceReference.PdbEntity),
                sourceId:this.queryId,
                provenanceName: TrackUtils.getProvenanceConfigFormTarget(this.queryId,this.queryId as SequenceReference).name,
                provenanceColor: TrackUtils.getProvenanceConfigFormTarget(this.queryId,this.queryId as SequenceReference).color,
                value:s,
                begin:n+1
            }))
        };

        const targetSequenceDisplay: RcsbFvDisplayConfigInterface = {
            displayType: RcsbFvDisplayTypes.SEQUENCE,
            displayColor: "#333333",
            displayData: targetSequence
        };
        const mismatchDisplay: RcsbFvDisplayConfigInterface = {
            displayType: RcsbFvDisplayTypes.PIN,
            displayColor: "#FF9999",
            displayData: mismatchData,
            minRatio: 5
        };


        const blockColor: string = "rgb("+gradient([153,153,255],[50,50,50],this.sequenceId).join(",")+")";
        const alignmentDisplay: RcsbFvDisplayConfigInterface = {
            displayType: RcsbFvDisplayTypes.BLOCK,
            displayColor: blockColor,
            displayData: alignedBlocks
        };
        const alignmentTrack: RcsbFvRowConfigInterface = {
            trackId: "targetSequenceTrack",
            rowTitle: this.targetId,
            displayType: RcsbFvDisplayTypes.COMPOSITE,
            trackColor: "#F9F9F9",
            titleFlagColor: TrackUtils.getProvenanceConfigFormTarget(this.targetId,SequenceReference.PdbEntity).color,
            displayConfig: [alignmentDisplay,mismatchDisplay,targetSequenceDisplay]
        };
        return [queryTrack,alignmentTrack];
    }

    buildPairwiseAlignment(): Array<RcsbFvRowConfigInterface>{
        const qA: Array<string> = this.queryAlignment.split('');
        const tA: Array<string> = this.targetAlignment.split('');

        const alignedBlocks: Array<RcsbFvTrackDataElementInterface> = [];
        const mismatchData: Array<RcsbFvTrackDataElementInterface> = [];
        const querySeq: Array<RcsbFvTrackDataElementInterface> = [];
        const targetSeq: Array<RcsbFvTrackDataElementInterface> = [];
        let currentQueryIndex: number = this.queryBegin;
        let currentTargetIndex: number = this.targetBegin;

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
            querySeq.push({
                begin:i+1,
                value:q,
                source:RcsbAnnotationConstants.provenanceName.userInput,
                sourceId:this.queryId,
                provenanceName: this.queryId,
                provenanceColor: RcsbAnnotationConstants.provenanceColorCode.external,
                oriBegin: q != "-" ? currentQueryIndex : undefined

            });
            if(q!="-"){
                currentQueryIndex++;
            }
            targetSeq.push({
                begin:i+1,
                value:t,
                source:TrackUtils.transformSourceFromTarget(this.targetId,SequenceReference.PdbEntity),
                sourceId:this.targetId,
                provenanceName: TrackUtils.getProvenanceConfigFormTarget(this.targetId,SequenceReference.PdbEntity).name,
                provenanceColor: TrackUtils.getProvenanceConfigFormTarget(this.targetId,SequenceReference.PdbEntity).color,
                oriBegin: t != "-" ? currentTargetIndex : undefined

            });
            if(t!="-"){
                currentTargetIndex++;
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
            rowTitle: this.queryId,
            titleFlagColor: TrackUtils.getProvenanceConfigFormTarget(this.queryId,SequenceReference.PdbEntity).color,
            nonEmptyDisplay: true,
            trackData: querySeq
        };

        const targetTrack: RcsbFvRowConfigInterface = {
            trackId: "target_sequence",
            displayType: RcsbFvDisplayTypes.SEQUENCE,
            trackColor: "#F9F9F9",
            displayColor: "#000000",
            rowTitle: this.targetId,
            titleFlagColor: TrackUtils.getProvenanceConfigFormTarget(this.targetId,SequenceReference.PdbEntity).color,
            nonEmptyDisplay: true,
            trackData: targetSeq
        };

        const mismatchDisplay: RcsbFvDisplayConfigInterface = {
            displayType: RcsbFvDisplayTypes.PIN,
            displayColor: "#FF9999",
            displayData: mismatchData,
            minRatio: 5
        };
        const blockColor: string = "rgb("+gradient([153,153,255],[50,50,50],this.sequenceId).join(",")+")";
        const alignmentDisplay: RcsbFvDisplayConfigInterface = {
            displayType: RcsbFvDisplayTypes.BLOCK,
            displayColor: blockColor,
            displayData: alignedBlocks
        };

        const alignmentTrack: RcsbFvRowConfigInterface = {
            trackId: "targetSequenceTrack",
            displayType: RcsbFvDisplayTypes.COMPOSITE,
            trackColor: "#F9F9F9",
            rowTitle:" ",
            titleFlagColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
            displayConfig: [alignmentDisplay,mismatchDisplay]
        };
        return [queryTrack,alignmentTrack,targetTrack];
    }

    private addBlockTerminalTags(alignedBlocks: Array<RcsbFvTrackDataElementInterface>): void{
        if(alignedBlocks[0].oriBegin ?? 0 > 1){
            alignedBlocks[0].openBegin = true;
        }
        for(let n=0; n<(alignedBlocks.length-1); n++){
            const oriEnd = alignedBlocks[n].oriEnd;
            if( oriEnd && oriEnd +1 != alignedBlocks[n+1].oriBegin){
                alignedBlocks[n].openEnd = true;
                alignedBlocks[n+1].openBegin = true;

            }
        }
        const oriEnd = alignedBlocks[alignedBlocks.length-1].oriEnd;
        if(oriEnd && oriEnd < this.targetSequence.length){
            alignedBlocks[alignedBlocks.length-1].openEnd = true;
        }
        FeatureTools.mergeBlocks(alignedBlocks);
    }
}