import {RcsbFvLocationViewInterface, RcsbFvTrackData} from "@bioinsilico/rcsb-saguaro";

export class UpdateGenomeSequenceData {
    process: number = 0
    update(ncbiId: string, strand: number, reverse: boolean, trackWidth?: number): ((where: RcsbFvLocationViewInterface) => Promise<RcsbFvTrackData>) {
        return (where: RcsbFvLocationViewInterface) => {
            window.clearTimeout(this.process);
            return new Promise<RcsbFvTrackData>((resolve, reject) => {
                const delta: number = trackWidth ? trackWidth / (where.to - where.from) : 1000 / (where.to - where.from);
                if (delta > 4) {
                    let N: number = 0;
                    const timeout: number = 3000;
                    const getGenomeSequence: ()=>void = ()=> {
                        const Http = new XMLHttpRequest();
                        Http.timeout = timeout*5;
                        const url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=' + ncbiId + '&from=' + where.from + '&to=' + where.to + '&strand=' + strand + '&rettype=fasta&retmode=text';
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
        }
    }
}
