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

type NcbiSummaryInterface = Record<string,ChromosomeMetadataInterface | TaxonomyMetadataInterface >;

interface NcbiSummaryResultInterface {
    result: NcbiSummaryInterface & {
        uids: string[];
    }
}

//TODO are static attributes/methods safe in this case ?
//TODO change `XMLHttpRequest` to `fetch`
const attributes:{
    timeout:number;
    httpTimeout: number;
    jobTask: null|Subscription;
} = {
    timeout: 3000,
    httpTimeout: 10000,
    jobTask: null
}


function requestChromosomeData(chrId: string): Promise<ChromosomeMetadataInterface>{
    attributes.jobTask?.unsubscribe();
    const urlPrefix:string  = resource.ncbi_summary_nuccore.url;
    const urlSuffix: string = resource.ncbi_summary_nuccore.url_suffix;
    return new Promise<ChromosomeMetadataInterface>((resolve)=>{
        const recursiveRequest = () =>{
            const url: string = urlPrefix+chrId+urlSuffix;
            const Http = new XMLHttpRequest();
            Http.timeout = attributes.httpTimeout;
            Http.open("GET", url);
            Http.send();
            Http.onloadend = () => {
                if(Http.responseText.length == 0){
                    attributes.jobTask = asyncScheduler.schedule(()=>{
                        recursiveRequest();
                    },attributes.timeout);
                } else {
                    const jsonResult: NcbiSummaryResultInterface = JSON.parse(Http.responseText) as NcbiSummaryResultInterface;
                    const uid: string = jsonResult.result.uids[0];
                    const out: ChromosomeMetadataInterface = jsonResult.result[uid] as ChromosomeMetadataInterface;
                    out.ncbiId = chrId
                    resolve(out);
                }
            };
            Http.onerror = () => {
                if(attributes.jobTask)
                    attributes.jobTask.unsubscribe();
                attributes.jobTask = asyncScheduler.schedule(()=>{
                    recursiveRequest();
                },attributes.timeout);
            };
        };
        recursiveRequest();
    });
}

function requestTaxonomyData(taxId: string): Promise<TaxonomyMetadataInterface>{
    if(attributes.jobTask)
        attributes.jobTask.unsubscribe();
    const urlPrefix: string  = resource.ncbi_summary_taxonomy.url;
    const urlSuffix: string = resource.ncbi_summary_taxonomy.url_suffix;
    return new Promise<TaxonomyMetadataInterface>((resolve)=>{
        const recursiveRequest = () =>{
            const url: string = urlPrefix+taxId+urlSuffix;
            const Http = new XMLHttpRequest();
            Http.timeout = attributes.httpTimeout;
            Http.open("GET", url);
            Http.send();
            Http.onloadend = () => {
                if(Http.responseText.length == 0){
                    attributes.jobTask = asyncScheduler.schedule(()=>{
                        recursiveRequest();
                    },attributes.timeout);
                }else {
                    const jsonResult: NcbiSummaryResultInterface = JSON.parse(Http.responseText) as NcbiSummaryResultInterface;
                    const uid: string = jsonResult.result.uids[0];
                    resolve(jsonResult.result[uid] as TaxonomyMetadataInterface);
                }
            };
            Http.onerror = () => {
                attributes.jobTask = asyncScheduler.schedule(()=>{
                    recursiveRequest();
                },attributes.timeout);
            };
        };
        recursiveRequest();
    });
}

const methods = {
    requestChromosomeData,
    requestTaxonomyData
}

export {methods as NcbiSummary};