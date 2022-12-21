import {asyncScheduler, Subscription} from "rxjs";
import * as resource from "../../RcsbServerConfig/web.resources.json";

export interface ChromosomeMetadataInterface {
    ncbiId: string;
    title: string;
    organism: string;
    extra: string;
    taxid: number;
    length: number;
    subtype: string;
    subname: string;
    uid:number;
}

export interface TaxonomyMetadataInterface {
    scientificname: string;
    commonname: string;
    taxid: number;
    uid:number;
}

interface NcbiSummaryInterface {
    result:{
        uids: string[];
    }
}

//TODO are static attributes/methods safe in this case ?
//TODO change `XMLHttpRequest` to `fetch`

export class NcbiSummary {

    private static timeout = 3000;
    private static httpTimeout = 10000;
    private static jobTask: Subscription | null = null;

    public static requestChromosomeData(chrId: string): Promise<ChromosomeMetadataInterface>{
        if(NcbiSummary.jobTask)
            NcbiSummary.jobTask.unsubscribe();
        const urlPrefix:string  = (resource as any).ncbi_summary_nuccore.url;
        const urlSuffix: string = (resource as any).ncbi_summary_nuccore.url_suffix;
        return new Promise<ChromosomeMetadataInterface>((resolve, reject)=>{
            const recursiveRequest = () =>{
                const url: string = urlPrefix+chrId+urlSuffix;
                const Http = new XMLHttpRequest();
                Http.timeout = NcbiSummary.httpTimeout;
                Http.open("GET", url);
                Http.send();
                Http.onloadend = (e) => {
                    if(Http.responseText.length == 0){
                        NcbiSummary.jobTask = asyncScheduler.schedule(()=>{
                            recursiveRequest();
                        },NcbiSummary.timeout);
                    }else {
                        const jsonResult: any = JSON.parse(Http.responseText);
                        const uid: string = (jsonResult as NcbiSummaryInterface).result.uids[0];
                        const out: ChromosomeMetadataInterface = jsonResult.result[uid] as ChromosomeMetadataInterface;
                        out.ncbiId = chrId
                        resolve(out);
                    }
                };
                Http.onerror = (e) => {
                    if(NcbiSummary.jobTask)
                        NcbiSummary.jobTask.unsubscribe();
                    NcbiSummary.jobTask = asyncScheduler.schedule(()=>{
                        recursiveRequest();
                    },NcbiSummary.timeout);
                };
            };
            recursiveRequest();
        });
    }

    public static requestTaxonomyData(taxId: string): Promise<TaxonomyMetadataInterface>{
        if(NcbiSummary.jobTask)
            NcbiSummary.jobTask.unsubscribe();
        const urlPrefix:string  = (resource as any).ncbi_summary_taxonomy.url;
        const urlSuffix: string = (resource as any).ncbi_summary_taxonomy.url_suffix;
        return new Promise<TaxonomyMetadataInterface>((resolve, reject)=>{
            const recursiveRequest = () =>{
                const url: string = urlPrefix+taxId+urlSuffix;
                const Http = new XMLHttpRequest();
                Http.timeout = NcbiSummary.httpTimeout;
                Http.open("GET", url);
                Http.send();
                Http.onloadend = (e) => {
                    if(Http.responseText.length == 0){
                        NcbiSummary.jobTask = asyncScheduler.schedule(()=>{
                            recursiveRequest();
                        },NcbiSummary.timeout);
                    }else {
                        const jsonResult: any = JSON.parse(Http.responseText);
                        const uid: string = (jsonResult as NcbiSummaryInterface).result.uids[0];
                        resolve(jsonResult.result[uid] as TaxonomyMetadataInterface);
                    }
                };
                Http.onerror = (e) => {
                    NcbiSummary.jobTask = asyncScheduler.schedule(()=>{
                        recursiveRequest();
                    },NcbiSummary.timeout);
                };
            };
            recursiveRequest();
        });
    }
}