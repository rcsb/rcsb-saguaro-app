import {RcsbFvCore} from "./RcsbFvCore";
import {
    AlignmentResponse,
    QueryAlignmentArgs,
    SequenceReference,
    TargetAlignment
} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";


import {RcsbFvLocationViewInterface, RcsbFvTrackData, RcsbFvBoardConfigInterface, RcsbFvRowConfigInterface, RcsbFvDisplayTypes, RcsbFvTrackDataElementInterface} from '@bioinsilico/rcsb-saguaro';
import {RcsbFvQuery} from "../../RcsbGraphQL/RcsbFvQuery";
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";

export class RcsbFvChromosome extends RcsbFvCore {
    private rcsbFvQuery: RcsbFvQuery = new RcsbFvQuery();
    private readonly MAX_REQUESTS: number = 50;
    private readonly targetAlignmentList: Array<Array<TargetAlignment>> = new Array<Array<TargetAlignment>>();
    private maxRange: number = 0;
    private trackWidth: number = 2000;

    public buildChromosomeFv(ncbiId: string): void {

        const updateData: (where: RcsbFvLocationViewInterface) => Promise<RcsbFvTrackData> = (where: RcsbFvLocationViewInterface) => {
            return new Promise<RcsbFvTrackData>((resolve, reject) => {
                const delta: number = this.trackWidth/(where.to - where.from);
                if (delta > 4) {
                    const Http = new XMLHttpRequest();
                    const url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=' + ncbiId + '&from=' + where.from + '&to=' + where.to + '&strand=1&rettype=fasta&retmode=text';
                    Http.open("GET", url);
                    Http.send();
                    Http.onloadend = (e) => {
                        const sequence: string = Http.responseText.split("\n").slice(1).join("");
                        const selectedOption: RcsbFvTrackData = [{begin: where.from, value: sequence}];
                        resolve(selectedOption);
                    };
                    Http.onerror = (e) => {
                        reject("HTTP error while access URL: " + url);
                    };
                } else {
                    resolve(null);
                }
            });
        };
        this.rowConfigData.push({
            trackId: "mainSequenceTrack_" + ncbiId,
            displayType: RcsbFvDisplayTypes.SEQUENCE,
            trackColor: "#F9F9F9",
            displayColor: "#000000",
            rowTitle: ncbiId,
            titleFlagColor:RcsbAnnotationConstants.provenanceColorCode.external,
            updateDataOnMove: updateData
        });
        this.collectChromosomeAlignments({
            queryId: ncbiId,
            from: SequenceReference.NcbiGenome,
            to: SequenceReference.PdbEntity
        });
    }

    private collectChromosomeAlignments(requestConfig: QueryAlignmentArgs) {
        const promiseList: Array<{index: number; promise:Promise<AlignmentResponse>}> = new Array<{index: number; promise:Promise<AlignmentResponse>}>();
        for(let i=0;i<30;i++){
            promiseList.push({index: i, promise: this.rcsbFvQuery.requestAlignment({
                queryId: requestConfig.queryId,
                from: requestConfig.from,
                to: requestConfig.to,
                range: i*10000000+"-"+(i+1)*10000000
            })});
        }
        this.collectPromisedRanges(requestConfig, promiseList);
    }

    private collectPromisedRanges(requestConfig: QueryAlignmentArgs, promiseList: Array<{index: number; promise:Promise<AlignmentResponse>}>, exit?: number){
        console.log("Requesting "+promiseList.length+" ranges");
        if(exit && exit > this.MAX_REQUESTS)
            throw "1D COORDINATE SERVER ERROR: max requested limit";
        if(exit) exit++;
        if(promiseList.length > 0){
            const failed: Array<{index: number; promise:Promise<AlignmentResponse>}> = new Array<{index: number; promise:Promise<AlignmentResponse>}>();
            Promise.allSettled(promiseList.map(r=>r.promise)).then((result)=> {
                result.forEach((x: PromiseSettledResult<AlignmentResponse>, n: number) => {
                    if(x.status === "fulfilled"){
                        this.targetAlignmentList[promiseList[n].index] = (x as PromiseFulfilledResult<AlignmentResponse>).value.target_alignment ;
                    }else{
                        console.warn("Failed range index "+promiseList[n].index);
                        const i: number = promiseList[n].index;
                        failed.push({index: i, promise: this.rcsbFvQuery.requestAlignment({
                                queryId: requestConfig.queryId,
                                from: requestConfig.from,
                                to: requestConfig.to,
                                range: i*10000000+"-"+(i+1)*10000000
                            })});
                    }
                });
                this.collectPromisedRanges(requestConfig, failed, exit ?? 1 );
            });
        }else{
            this.plot();
        }
    }

    private collectRange(requestConfig: QueryAlignmentArgs, index:number){
        this.rcsbFvQuery.requestAlignment({
            queryId: requestConfig.queryId,
            from: requestConfig.from,
            to: requestConfig.to,
            range: index*10000000+"-"+(index+1)*10000000
        }).then(alignment=>{
            if(index<30) {
                this.collectExons(alignment.target_alignment);
                this.collectRange(requestConfig, index+1);
            }else{
                this.plot();
            }
        })
    }

    private collectExons(targetAlignmentList: Array<TargetAlignment>): Promise<Array<RcsbFvRowConfigInterface>> {
        return new Promise<Array<RcsbFvRowConfigInterface>>((resolve,reject) => {
            const entities: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
            targetAlignmentList.forEach((targetAlignment,i) => {
                const alignedBlocks: Array<RcsbFvTrackDataElementInterface> = [];
                if(targetAlignment.orientation>0) {
                    alignedBlocks.push({
                        begin: targetAlignment.aligned_regions[0].query_begin,
                        end: targetAlignment.aligned_regions[targetAlignment.aligned_regions.length-1].query_end,
                        gaps: [],
                        description:[targetAlignment.target_id]
                    });
                    if(targetAlignment.aligned_regions[targetAlignment.aligned_regions.length-1].query_end > this.maxRange)
                        this.maxRange = targetAlignment.aligned_regions[targetAlignment.aligned_regions.length-1].query_end;
                    targetAlignment.aligned_regions.forEach((region,n) => {
                        if((n+1)<targetAlignment.aligned_regions.length)
                            alignedBlocks[0].gaps.push({
                                begin: region.query_end,
                                end: targetAlignment.aligned_regions[n+1].query_begin,
                                isConnected: true
                            });
                    });
                }else{
                    alignedBlocks.push({
                        end: targetAlignment.aligned_regions[0].query_begin,
                        begin: targetAlignment.aligned_regions[targetAlignment.aligned_regions.length-1].query_end,
                        gaps: [],
                        description:[targetAlignment.target_id]
                    });
                    if(targetAlignment.aligned_regions[0].query_begin>this.maxRange)
                        this.maxRange = targetAlignment.aligned_regions[0].query_begin;
                    targetAlignment.aligned_regions.reverse().forEach((region,n) => {
                        if((n+1)<targetAlignment.aligned_regions.length)
                            alignedBlocks[0].gaps.push({
                                end: targetAlignment.aligned_regions[n+1].query_end,
                                begin: region.query_begin,
                                isConnected: true
                            });
                    })
                }
                entities.push({
                    trackId: "pdbTracks_"+Math.random().toString(36).substr(2),
                    displayType: RcsbFvDisplayTypes.BLOCK,
                    trackColor: "#F9F9F9",
                    rowTitle: "",
                    selectDataInRangeFlag: true,
                    hideEmptyTrackFlag: true,
                    titleFlagColor:RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                    trackData: alignedBlocks,
                    minRatio:1/10000,
                    displayColor: "#65a0ff"
                });
            });
            resolve(
                this.simplifyExonTracks(entities.sort((a,b)=>{
                    return parseFloat((a.trackData[0].begin-b.trackData[0].begin)+"."+(a.trackData[0].end-b.trackData[0].end));
                }))
            );
        });
    }

    private simplifyExonTracks(tracks: Array<RcsbFvRowConfigInterface>): Array<RcsbFvRowConfigInterface> {
        const lightTracks: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
        tracks.forEach(t=>{
            if(lightTracks.length == 0){
                lightTracks.push(t);
            }else{
                const trackBegin: number = t.trackData[0].begin;
                const trackEnd: number = t.trackData[t.trackData.length-1].end;
                const N: number = lightTracks.length-1;
                const begin: number = lightTracks[N].trackData[0].begin;
                const end: number = lightTracks[N].trackData[0].end;
                if(!(trackBegin == begin && trackEnd == end)){
                    lightTracks.push(t);
                }else{
                    lightTracks[N].trackData[0].description.push(t.trackData[0].description[0]);
                }
            }
        });
        return lightTracks;
    }

    private mergeExonTracks(tracks: Array<RcsbFvRowConfigInterface>): Array<RcsbFvRowConfigInterface> {
        const lightTracks: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
        tracks.forEach(t=>{
            if(lightTracks.length == 0){
                lightTracks.push(t);
            }else{
                const trackBegin: number = t.trackData[0].begin;
                const trackEnd: number = t.trackData[t.trackData.length-1].end;
                let index: number = -1;
                lightTracks.forEach((lT,n)=>{
                    const N: number = lT.trackData.length-1;
                    const begin: number = lT.trackData[N].begin;
                    const end: number = lT.trackData[N].end;
                    if(trackBegin == begin && trackEnd == end){
                        index = -2;
                    }else if(trackBegin > end && index == -1){
                        index = n;
                    }
                });
                if(index>=0){
                    lightTracks[index].trackData.push(t.trackData[0]);
                }else if(index == -1){
                    lightTracks.push(t);
                }
            }
        });
        return lightTracks;
    }

    private plot(): void{
        const promiseList: Array<Promise<Array<RcsbFvRowConfigInterface>>> = new Array<Promise<Array<RcsbFvRowConfigInterface>>>();
        this.targetAlignmentList.forEach(tA=>{
            promiseList.push(this.collectExons(tA));
        });
        Promise.allSettled(promiseList).then(results=>{
            let tracks: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
            results.forEach(r=>{
                if(r.status === "fulfilled") {
                     tracks = tracks.concat((r as PromiseFulfilledResult<Array<RcsbFvRowConfigInterface>>).value);

                }
            })
            this.rowConfigData = this.rowConfigData.concat(this.mergeExonTracks(tracks));
            console.log("RENDERING");
            const boardConfig: RcsbFvBoardConfigInterface = {...this.boardConfigData,trackWidth:this.trackWidth,borderColor:"#F9F9F9"};
            boardConfig.length = Math.floor(this.maxRange + 0.01*this.maxRange);
            boardConfig.includeAxis = true;
            this.rcsbFv.setBoardConfig(boardConfig);
            this.rcsbFv.setBoardData(this.rowConfigData);
            this.rcsbFv.init();
        })
    }

}
