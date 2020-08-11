import {RcsbFvLink} from "@bioinsilico/rcsb-saguaro/dist/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import * as resource from "../../../web.resources.json";
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";

export class ParseLink {
    private static readonly rcsbLigand: RegExp = new RegExp(/^(ligand)(\s)(\w{1,3})$/);
    static build(title: string): RcsbFvLink{
        let match: RegExpExecArray;
        if(match = ParseLink.rcsbLigand.exec(title)) {
            return {
                visibleTex: match[3],
                url: (resource as any).rcsb_ligand.url+match[3],
                style:{
                    color:RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                    fontWeight:"bold"
                }
            }

        }
        return {visibleTex: title, style:{fontWeight:"bold"}}
    }
}