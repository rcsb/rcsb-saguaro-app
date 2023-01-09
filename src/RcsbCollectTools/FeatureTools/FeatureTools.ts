import {RcsbFvLink, RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import * as resource from "../../RcsbServerConfig/web.resources.json";
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";

export class FeatureTools {

    private static readonly rcsbLigand: RegExp = new RegExp(/^(ligand)(\s)(\w{1,3})$/);

    static mergeBlocks(blocks: Array<RcsbFvTrackDataElementInterface>){
        let merged = false;
        do{
            merged = false;
            for(let n=0; n<(blocks.length-1); n++){
                const end = blocks[n].end;
                if(!end)
                    return;
                if( (blocks[n].oriEnd ?? Number.MIN_SAFE_INTEGER)+1 == blocks[n+1].oriBegin && blocks[n].color === blocks[n+1].color){
                    if(blocks[n].gaps == null)
                        blocks[n].gaps = []
                    blocks[n].gaps?.push({begin:end,end:blocks[n+1].begin, isConnected:true});
                    blocks[n].end = blocks[n+1].end;
                    blocks[n].oriEnd = blocks[n+1].oriEnd;
                    blocks.splice((n+1),1);
                    merged = true;
                    break;
                }
            }
        }while(merged);
    }
    static parseLink(title: string): RcsbFvLink{
        let match: RegExpExecArray | null;
        if(match = FeatureTools.rcsbLigand.exec(title)) {
            return {
                visibleTex: match[3],
                url: (resource as any).rcsb_ligand.url+match[3],
                style:{
                    color:RcsbAnnotationConstants.provenanceColorCode.rcsbLink,
                    fontWeight:"bold"
                }
            }

        }else if(title == "binding_site"){
            return {visibleTex: "", style:{fontWeight:"bold"}}
        }
        return {visibleTex: title, style:{fontWeight:"bold"}}
    }
}