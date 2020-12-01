import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";

export class FeatureTools {
    static mergeBlocks(blocks: Array<RcsbFvTrackDataElementInterface>){
        let merged = false;
        do{
            merged = false;
            for(let n=0; n<(blocks.length-1); n++){
                if(blocks[n].oriEnd+1 == blocks[n+1].oriBegin && blocks[n].color === blocks[n+1].color){
                    if(blocks[n].gaps == null)
                        blocks[n].gaps = []
                    blocks[n].gaps.push({begin:blocks[n].end,end:blocks[n+1].begin, isConnected:true});
                    blocks[n].end = blocks[n+1].end;
                    blocks[n].oriEnd = blocks[n+1].oriEnd;
                    blocks.splice((n+1),1);
                    merged = true;
                    break;
                }
            }
        }while(merged);
    }
}