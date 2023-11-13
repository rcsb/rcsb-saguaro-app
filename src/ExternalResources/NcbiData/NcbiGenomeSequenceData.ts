import {asyncScheduler, Subscription} from "rxjs";
import {RcsbFvTrackData} from "@rcsb/rcsb-saguaro/lib/RcsbDataManager/RcsbDataManager";
import {LocationViewInterface} from "@rcsb/rcsb-saguaro/lib/RcsbBoard/RcsbBoard";
import resource from "../../RcsbServerConfig/web.resources.json";

export class NcbiGenomeSequenceData {
    private static readonly urlPrefix:string  = (resource as any).ncbi_genome_sequence.url;
    private static readonly urlSuffix: string = (resource as any).ncbi_genome_sequence.url_suffix;
    public static update(ncbiId: string, strand: number, reverse: boolean, trackWidth?: number): ((where: LocationViewInterface) => Promise<RcsbFvTrackData>) {
        let process: Subscription | null = null;
        return (where: LocationViewInterface) => {
            if(process)
                process.unsubscribe();
            return new Promise<RcsbFvTrackData>((resolve, reject) => {
                const delta: number = trackWidth ? trackWidth / (where.to - where.from) : 1000 / (where.to - where.from);
                if (delta > 4) {
                    let N: number = 0;
                    const timeout: number = 5000;
                    const getGenomeSequence: ()=>void = ()=> {
                        const Http = new XMLHttpRequest();
                        Http.timeout = timeout;
                        const url = NcbiGenomeSequenceData.urlPrefix + 'id=' + ncbiId + '&from=' + where.from + '&to=' + where.to + '&strand=' + strand + NcbiGenomeSequenceData.urlSuffix;
                        Http.open("GET", url);
                        Http.send();
                        Http.onloadend = (e) => {
                            const sequence: string = Http.responseText.split("\n").slice(1).join("");
                            if(sequence.length<1){
                                N++;
                                console.warn("HTTP error while access URL: " + url + " - empty sequence - "+ N);
                                if(N<4){
                                    process = asyncScheduler.schedule(()=>{
                                        getGenomeSequence();
                                    },timeout);
                                }else{
                                    reject("HTTP error while access URL: " + url + " - No more attempts after "+N);
                                }
                            }else {
                                const selectedOption: RcsbFvTrackData = [{
                                    begin: where.from,
                                    label: reverse ? sequence.split("").reverse().join("") : sequence
                                }];
                                resolve(selectedOption);
                            }
                        };
                        Http.onerror = (e) => {
                            N++;
                            console.warn("HTTP error while access URL: " + url + " - "+ N);
                            if(N<4){
                                process = asyncScheduler.schedule(()=>{
                                    getGenomeSequence();
                                },timeout);
                            }else{
                                reject("HTTP error while access URL: " + url + " - No more attempts after "+ N);
                            }

                        };
                    }
                    getGenomeSequence();
                } else {
                    resolve([]);
                }
            });
        };
    }
}
