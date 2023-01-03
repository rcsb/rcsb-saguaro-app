import {asyncScheduler, Subscription} from "rxjs";
import {RcsbFvLocationViewInterface, RcsbFvTrackData} from "@rcsb/rcsb-saguaro";
import * as resource from "../../RcsbServerConfig/web.resources.json";

const urlPrefix:string  = (resource as Record<string, {url:string;url_suffix?:string;}>).ncbi_genome_sequence.url;
const urlSuffix: string = (resource as Record<string, {url:string;url_suffix?:string;}>).ncbi_genome_sequence.url_suffix ?? "";

function update(ncbiId: string, strand: number, reverse: boolean, trackWidth?: number): ((where: RcsbFvLocationViewInterface) => Promise<RcsbFvTrackData>) {
    let process: Subscription | null = null;
    return (where: RcsbFvLocationViewInterface) => {
        if(process)
            process.unsubscribe();
        return new Promise<RcsbFvTrackData>((resolve, reject) => {
            const delta: number = trackWidth ? trackWidth / (where.to - where.from) : 1000 / (where.to - where.from);
            if (delta > 4) {
                let N = 0;
                const timeout = 5000;
                const getGenomeSequence: ()=>void = ()=> {
                    const Http = new XMLHttpRequest();
                    Http.timeout = timeout;
                    const url = `${urlPrefix}id=${ncbiId}&from=${where.from}&to=${where.to}&strand=${strand}${urlSuffix}`;
                    Http.open("GET", url);
                    Http.send();
                    Http.onloadend = () => {
                        const sequence: string = Http.responseText.split("\n").slice(1).join("");
                        if(sequence.length<1){
                            N++;
                            console.warn(`HTTP error while access URL: ${url} - empty sequence - ${N}`);
                            if(N<4){
                                process = asyncScheduler.schedule(()=>{
                                    getGenomeSequence();
                                },timeout);
                            }else{
                                reject(`HTTP error while access URL: ${url} - No more attempts after ${N}`);
                            }
                        }else {
                            const selectedOption: RcsbFvTrackData = [{
                                begin: where.from,
                                value: reverse ? sequence.split("").reverse().join("") : sequence
                            }];
                            resolve(selectedOption);
                        }
                    };
                    Http.onerror = () => {
                        N++;
                        console.warn(`HTTP error while access URL: ${url} - ${N}`);
                        if(N<4){
                            process = asyncScheduler.schedule(()=>{
                                getGenomeSequence();
                            },timeout);
                        }else{
                            reject(`HTTP error while access URL: ${url} - No more attempts after ${N}`);
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

const methods = {update}
export {methods as NcbiGenomeSequenceData};
