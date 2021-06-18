import {PairwiseAlignmentBuilder, PairwiseAlignmentInterface} from "../PairwiseAlignmentTools/PairwiseAlignmentBuilder";
import {RcsbFv, RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro";
import {rcsbFvCtxManager} from "./RcsbFvContextManager";

export class RcsbFvPairwiseAligmentBuilder {
     static async buildPairwiseAlignment(elementId:string, psa: PairwiseAlignmentInterface): Promise<void> {
         return new Promise<void>((resolve, reject)=>{
             if(elementId == null)
                 throw ("DOM elementId is null");

             const pab: PairwiseAlignmentBuilder = new PairwiseAlignmentBuilder(psa);
             const config: RcsbFvBoardConfigInterface = rcsbFvCtxManager.getBoardConfig() != null ? {
                 rowTitleWidth: 120,
                 trackWidth: 800,
                 ...rcsbFvCtxManager.getBoardConfig(),
                 length: pab.getLength(),
                 includeAxis: !psa.pairwiseView
             } : {
                 rowTitleWidth: 120,
                 trackWidth: 800,
                 length: pab.getLength(),
                 includeAxis: !psa.pairwiseView
             };
             if(rcsbFvCtxManager.getFv(elementId) != null ) {
                 rcsbFvCtxManager.getFv(elementId).updateBoardConfig({
                     boardConfigData:config,
                     rowConfigData:psa.pairwiseView ? pab.buildPairwiseAlignment() : pab.buildReferenceAlignment()
                 });
             }else{
                 const rcsbFV: RcsbFv = new RcsbFv({
                     rowConfigData: psa.pairwiseView ? pab.buildPairwiseAlignment() : pab.buildReferenceAlignment(),
                     boardConfigData: config,
                     elementId: elementId
                 })
                 rcsbFvCtxManager.setFv(elementId,rcsbFV);
             }
             resolve();
         });
    }
}