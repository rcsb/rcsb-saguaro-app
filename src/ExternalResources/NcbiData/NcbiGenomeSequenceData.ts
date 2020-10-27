import {RcsbFvLocationViewInterface, RcsbFvTrackData} from "@bioinsilico/rcsb-saguaro";
import * as resource from "../../../web.resources.json";

export class NcbiGenomeSequenceData {
    process: number = 0;
    urlPrefix:string  = (resource as any).ncbi_genome_sequence.url;
    urlSuffix: string = (resource as any).ncbi_genome_sequence.url_suffix;
    update(ncbiId: string, strand: number, reverse: boolean, trackWidth?: number): ((where: RcsbFvLocationViewInterface) => Promise<RcsbFvTrackData>) {
        return (where: RcsbFvLocationViewInterface) => {
            window.clearTimeout(this.process);
            return new Promise<RcsbFvTrackData>((resolve, reject) => {
                const delta: number = trackWidth ? trackWidth / (where.to - where.from) : 1000 / (where.to - where.from);
                if (delta > 4) {
                    let N: number = 0;
                    const timeout: number = 5000;
                    const getGenomeSequence: ()=>void = ()=> {
                        const Http = new XMLHttpRequest();
                        Http.timeout = timeout;
                        const url = this.urlPrefix + 'id=' + ncbiId + '&from=' + where.from + '&to=' + where.to + '&strand=' + strand + this.urlSuffix;
                        Http.open("GET", url);
                        Http.send();
                        Http.onloadend = (e) => {
                            const sequence: string = Http.responseText.split("\n").slice(1).join("");
                            if(sequence.length<1){
                                N++;
                                console.warn("HTTP error while access URL: " + url + " - empty sequence - "+ N);
                                if(N<4){
                                    this.process = window.setTimeout(()=>{
                                        getGenomeSequence();
                                    },timeout);
                                }else{
                                    reject("HTTP error while access URL: " + url + " - No more attempts after "+N);
                                }
                            }else {
                                const selectedOption: RcsbFvTrackData = [{
                                    begin: where.from,
                                    value: reverse ? sequence.split("").reverse().join("") : sequence
                                }];
                                resolve(selectedOption);
                            }
                        };
                        Http.onerror = (e) => {
                            N++;
                            console.warn("HTTP error while access URL: " + url + " - "+ N);
                            if(N<4){
                                this.process = window.setTimeout(()=>{
                                    getGenomeSequence();
                                },timeout);
                            }else{
                                reject("HTTP error while access URL: " + url + " - No more attempts after "+ N);
                            }

                        };
                    }
                    getGenomeSequence();
                } else {
                    resolve(null);
                }
            });
        };
    }
}
