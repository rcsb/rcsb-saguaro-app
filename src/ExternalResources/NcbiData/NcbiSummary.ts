
import * as resource from "../../../web.resources.json";
import {RcsbFvTrackData} from "@bioinsilico/rcsb-saguaro";

export interface ChromosomeMetadataInterface {
    title: string;
    organism: string;
    taxid: number;
    length: number;
    subtype: string;
    subname: string;
    uid:number;
}

interface NcbiSummaryInterface {
    result:{
        uids: Array<string>;
    }
}

export class NcbiSummary {
    private static readonly url:string  = (resource as any).ncbi_summary.url;
    private static readonly urlSuffix: string = (resource as any).ncbi_summary.url_suffix;
    private static timeout = 3000;

    public static requestChromosomeData(chrId: string): Promise<ChromosomeMetadataInterface>{
        return new Promise<ChromosomeMetadataInterface>((resolve, reject)=>{
            const recursiveRequest = () =>{
                const url: string = NcbiSummary.url+chrId+NcbiSummary.urlSuffix;
                const Http = new XMLHttpRequest();
                Http.timeout = 3000;
                Http.open("GET", url);
                Http.send();
                Http.onloadend = (e) => {
                    if(Http.responseText.length == 0){
                        window.setTimeout(()=>{
                            recursiveRequest();
                        },NcbiSummary.timeout);
                    }else {
                        const jsonResult: any = JSON.parse(Http.responseText);
                        const uid: string = (jsonResult as NcbiSummaryInterface)?.result?.uids[0];
                        resolve(jsonResult.result[uid] as ChromosomeMetadataInterface);
                    }
                };
                Http.onerror = (e) => {
                    window.setTimeout(()=>{
                        recursiveRequest();
                    },NcbiSummary.timeout);
                };
            };
            recursiveRequest();
        });
    }
}