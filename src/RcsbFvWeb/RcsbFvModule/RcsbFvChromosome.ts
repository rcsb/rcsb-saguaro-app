import {RcsbFvCore} from "./RcsbFvCore";
import {
    AlignmentResponse,
    QueryAlignmentArgs,
    SequenceReference,
    TargetAlignment
} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";

import {
    RcsbFvDisplayTypes,
    RcsbFvLocationViewInterface,
    RcsbFvRowConfigInterface,
    RcsbFvTrackData,
    RcsbFvTrackDataElementInterface
} from '@bioinsilico/rcsb-saguaro';
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {RcsbFvModuleBuildInterface, RcsbFvModuleInterface} from "./RcsbFvModuleInterface";
import {RcsbFvAlignmentCollectorQueue} from "../RcsbFvWorkers/RcsbFvAlignmentCollectorQueue";

interface AlignmentPromideInterface {
    index: number;
    reference: SequenceReference;
    promise:Promise<AlignmentResponse>
}

export class RcsbFvChromosome extends RcsbFvCore implements RcsbFvModuleInterface {
    private readonly targetAlignmentList: Map<SequenceReference,Array<Array<TargetAlignment>>> = new Map<SequenceReference, Array<Array<TargetAlignment>>>([
        [SequenceReference.NcbiProtein, new Array<Array<TargetAlignment>>()],
        [SequenceReference.PdbEntity, new Array<Array<TargetAlignment>>()]
    ]);
    private maxRange: number = 0;
    private alignmentCollectorQueue: RcsbFvAlignmentCollectorQueue = new RcsbFvAlignmentCollectorQueue();
    private nTasks: number = 0;

    private buildChromosomeFv(ncbiId: string): void {

        const updateData: (where: RcsbFvLocationViewInterface) => Promise<RcsbFvTrackData> = (where: RcsbFvLocationViewInterface) => {
            return new Promise<RcsbFvTrackData>((resolve, reject) => {
                const delta: number = this.rcsbFv?.getBoardConfig().trackWidth ? this.rcsbFv.getBoardConfig().trackWidth / (where.to - where.from) : 1000 / (where.to - where.from);
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
        this.collectChromosomeAlignments(ncbiId);
    }

    private collectChromosomeAlignments(chrId: string) {
        for(let i=0;i<30;i++){
            this.nTasks++;
            this.alignmentCollectorQueue.sendTask({
                queryId: chrId,
                from: SequenceReference.NcbiGenome,
                to: SequenceReference.NcbiProtein,
                range: i*10000000+"-"+(i+1)*10000000
            }, (e)=>{
                const ar: AlignmentResponse = e as AlignmentResponse
                this.collectWorkerResults(i,SequenceReference.NcbiProtein,ar);
            });
            this.nTasks++;
            this.alignmentCollectorQueue.sendTask({
                queryId: chrId,
                from: SequenceReference.NcbiGenome,
                to: SequenceReference.PdbEntity,
                range: i*10000000+"-"+(i+1)*10000000
            }, (e)=>{
                const ar: AlignmentResponse = e as AlignmentResponse
                this.collectWorkerResults(i,SequenceReference.PdbEntity,ar);
            });
        }
    }

    private collectWorkerResults(index: number, reference: SequenceReference, alignment: AlignmentResponse): void{
        this.nTasks--;
        this.targetAlignmentList.get(reference)[index] = alignment.target_alignment;
        if(this.nTasks == 0){
            console.log("All Tasks Finished. Starting Rendering");
            this.plot();
        }
    }

    private collectExons(targetAlignmentList: Array<TargetAlignment>, blockColor: string, flagTitleColor: string): Promise<Array<RcsbFvRowConfigInterface>> {
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
                    titleFlagColor:flagTitleColor,
                    trackData: alignedBlocks,
                    minRatio:1/10000,
                    displayColor: blockColor,
                    overlap: true
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
        console.log("PRE-PROCESSING");
        this.targetAlignmentList.get(SequenceReference.NcbiProtein).forEach(tA=>{
            promiseList.push(this.collectExons(tA,RcsbAnnotationConstants.provenanceColorCode.external,RcsbAnnotationConstants.provenanceColorCode.external));
        });
        console.log("PROCESSING");
        Promise.allSettled(promiseList).then(results=>{
            let tracks: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
            results.forEach(r=>{
                if(r.status === "fulfilled") {
                     tracks = tracks.concat((r as PromiseFulfilledResult<Array<RcsbFvRowConfigInterface>>).value);

                }
            });
            this.rowConfigData = this.rowConfigData.concat(this.mergeExonTracks(tracks));
            const promiseList: Array<Promise<Array<RcsbFvRowConfigInterface>>> = new Array<Promise<Array<RcsbFvRowConfigInterface>>>();
            this.targetAlignmentList.get(SequenceReference.PdbEntity).forEach(tA=>{
                promiseList.push(this.collectExons(tA,RcsbAnnotationConstants.provenanceColorCode.rcsbPdb, RcsbAnnotationConstants.provenanceColorCode.rcsbPdb));
            });
            Promise.allSettled(promiseList).then(results=> {
                let tracks: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
                results.forEach(r=>{
                    if(r.status === "fulfilled") {
                        tracks = tracks.concat((r as PromiseFulfilledResult<Array<RcsbFvRowConfigInterface>>).value);

                    }
                });
                this.rowConfigData = this.rowConfigData.concat(this.mergeExonTracks(tracks));
                console.log("RENDERING");
                this.boardConfigData.borderColor = "#F9F9F9";
                this.boardConfigData.length = Math.floor(this.maxRange + 0.01*this.maxRange);
                this.boardConfigData.includeAxis = true;
                this.display();
            });
        });
    }

    public build(buildConfig: RcsbFvModuleBuildInterface): void {
        this.buildChromosomeFv(buildConfig.queryId);
    }
}
