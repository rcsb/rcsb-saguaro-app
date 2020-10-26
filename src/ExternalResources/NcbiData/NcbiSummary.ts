
import * as resource from "../../../web.resources.json";

export interface ChromosomeMetadataInterface {
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
        uids: Array<string>;
    }
}

export class NcbiSummary {

    private static timeout = 3000;

    public static requestChromosomeData(chrId: string): Promise<ChromosomeMetadataInterface>{
        const urlPrefix:string  = (resource as any).ncbi_summary_nuccore.url;
        const urlSuffix: string = (resource as any).ncbi_summary_nuccore.url_suffix;
        return new Promise<ChromosomeMetadataInterface>((resolve, reject)=>{
            const recursiveRequest = () =>{
                const url: string = urlPrefix+chrId+urlSuffix;
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

    public static requestTaxonomyData(taxId: string): Promise<TaxonomyMetadataInterface>{
        const urlPrefix:string  = (resource as any).ncbi_summary_taxonomy.url;
        const urlSuffix: string = (resource as any).ncbi_summary_taxonomy.url_suffix;
        return new Promise<TaxonomyMetadataInterface>((resolve, reject)=>{
            const recursiveRequest = () =>{
                const url: string = urlPrefix+taxId+urlSuffix;
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
                        resolve(jsonResult.result[uid] as TaxonomyMetadataInterface);
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