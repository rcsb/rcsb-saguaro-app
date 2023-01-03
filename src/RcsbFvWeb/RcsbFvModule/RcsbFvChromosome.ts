import {Subject} from "rxjs";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {
    AlignedRegion,
    AlignmentResponse,
    Coverage,
    SequenceReference,
    TargetAlignment
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";

import {
    RcsbFvDisplayTypes,
    RcsbFvLocationViewInterface,
    RcsbFvRowConfigInterface,
    RcsbFvTrackData,
    RcsbFvTrackDataElementInterface
} from '@rcsb/rcsb-saguaro';
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {RcsbFvAlignmentCollectorQueue} from "../RcsbFvWorkers/RcsbFvAlignmentCollectorQueue";
import {NcbiGenomeSequenceData} from "../../ExternalResources/NcbiData/NcbiGenomeSequenceData";
import {ChromosomeMetadataInterface, NcbiSummary} from "../../ExternalResources/NcbiData/NcbiSummary";
import Ideogram from 'ideogram';
import {ObservableHelper} from "../../RcsbUtils/Helpers/ObservableHelper";
import {rcsbClient} from "../../RcsbGraphQL/RcsbClient";

function sequenceDisplayDynamicUpdate( reference:SequenceReference, ranges: Map<[number,number],string>, trackWidth?: number): ((where: RcsbFvLocationViewInterface) => Promise<RcsbFvTrackData>){
    return (where: RcsbFvLocationViewInterface) => {
        const delta: number = trackWidth ? trackWidth / (where.to - where.from) : 1000 / (where.to - where.from);
        if (delta > 4) {
            const ids: string[] = new Array<string>();
            ranges.forEach((id, r) => {
                if (!(r[0] > where.to || r[1] < where.from))
                    ids.push(id);
            });
            return Promise.all(ids.map(id => {
                return rcsbClient.requestAlignment({
                    queryId: id,
                    from: reference,
                    to: SequenceReference.NcbiGenome
                });
            })).then(alignments => {
                const out: RcsbFvTrackData = new RcsbFvTrackData();
                alignments.forEach((a,n) => {
                    if(a.query_sequence == null)
                        return;
                    const sequence: string[] = a.query_sequence.split("");
                    a?.target_alignment?.forEach(ta => {
                        const orientation = ta?.orientation;
                        if(!orientation)
                            return;
                        ta?.aligned_regions?.forEach(r => {
                            if(!(r?.target_begin && r?.query_begin && r?.query_end) )
                                return;
                            const targetIndex: number | undefined = r?.target_begin;
                            const queryIndex: number | undefined = r?.query_begin;
                            const length: number = r?.query_end - r?.query_begin + 1;
                            for (let i = 0; i < length; i++) {
                                out.push({
                                    begin: targetIndex + orientation * (1+3*i),
                                    value: sequence[queryIndex - 1 + i],
                                    oriBegin: queryIndex + i,
                                    source: reference.toString(),
                                    sourceId: ids[n]
                                });
                            }
                        });
                    });
                });
                return out;
            });
        }else{
            return new Promise<RcsbFvTrackData>((resolve,reject)=>{
                resolve([]);
            });
        }
    };
}

//TODO This class needs a lot of improvements
//TODO this Module is not collecting alignments through AlignmentCollector
export class RcsbFvChromosome extends RcsbFvAbstractModule {
    private readonly targetAlignmentList: Map<SequenceReference,TargetAlignment[][]> = new Map<SequenceReference, TargetAlignment[][]>([
        [SequenceReference.NcbiProtein, new Array<TargetAlignment[]>()],
        [SequenceReference.Uniprot, new Array<TargetAlignment[]>()],
        [SequenceReference.PdbEntity, new Array<TargetAlignment[]>()]
    ]);

    private maxRange = 0;
    private minRange: number = Number.MAX_SAFE_INTEGER;
    private alignmentCollectorQueue: RcsbFvAlignmentCollectorQueue = new RcsbFvAlignmentCollectorQueue(12);
    private nTasks = 0;
    private completeTasks = 0;
    private pdbEntityTrack:  RcsbFvRowConfigInterface;
    private batchSize = 10000000;
    private beginView = 0;
    private endView = 0;
    private entityBegin = 0;
    private entityEnd = 0;
    private nonExonConfigData: RcsbFvRowConfigInterface[] = new Array<RcsbFvRowConfigInterface>();
    private featuresConfigData: RcsbFvRowConfigInterface[] = new Array<RcsbFvRowConfigInterface>();
    private targetCoverages: Map<string, Coverage> = new Map<string, Coverage>();
    private chrSet: string[] = new Array<string>();
    private targetFilterFlag = true;
    private entityId: string;
    private IDEOGRAM_DIV_ID = "chrIdeogramDiv";
    private TITLE_CHR_DIV_ID = "chrTitleDiv";
    private TITLE_CHR_REGION_ID = "chrTitleRegion";
    private currentDisplayedChrId = "";
    private elementSelectId: string;
    private readonly buildSubject: Subject<void> = new Subject<void>();
    private readonly targetsSubject: Subject<string[]> = new Subject<string[]>();

    private buildPdbGenomeFv(pdbEntityId: string, chrId?: string){
        this.entityId = pdbEntityId;
        Promise.all([SequenceReference.NcbiProtein, SequenceReference.Uniprot].map(to=>{
            return rcsbClient.requestAlignment({
                queryId: pdbEntityId,
                from: SequenceReference.PdbEntity,
                to: to
            });
        })).then(result=>{
            result.forEach(a=>{
                a?.target_alignment?.forEach(ta=>{
                    if(!(ta?.target_id && ta?.coverage))
                        return;
                    this.targetCoverages.set(ta.target_id, ta.coverage);
                });
            });
            this.alignmentCollectorQueue.sendTask({
                queryId: pdbEntityId,
                from: SequenceReference.PdbEntity,
                to: SequenceReference.NcbiGenome,
            }, async (e)=>{
                const ar: AlignmentResponse = e as AlignmentResponse
                await this.collectPdbWorkerResults(ar, pdbEntityId, chrId);
            });
        });
    }

    private buildFullGenomeRangeFv(chrId: string): void{
        this.plotChromosomeTitle(chrId);
        this.targetFilterFlag = false;
        this.genomeSequenceTracks(chrId);
        this.collectChromosomeAlignments(chrId, SequenceReference.PdbEntity);
        this.collectChromosomeAlignments(chrId, SequenceReference.Uniprot);
        this.collectChromosomeAlignments(chrId, SequenceReference.NcbiProtein);
    }

    private async collectPdbWorkerResults(ar: AlignmentResponse, pdbEntityId: string, chrId?: string): Promise<void>{
        if(!ar.target_alignment )
            return;
        const exonTracks: RcsbFvRowConfigInterface[] = this.collectExons(
            ar.target_alignment as TargetAlignment[],
            "target",
            RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
            RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
            SequenceReference.PdbEntity,
            chrId
        );
        this.pdbEntityTrack = this.mergeExonTracks(exonTracks, SequenceReference.PdbEntity)[0];
        this.pdbEntityTrack.displayConfig?.[0].displayData?.forEach(d=>{
                d.description = [pdbEntityId];
        });
        this.addSequences([this.pdbEntityTrack],SequenceReference.PdbEntity);
        this.pdbEntityTrack.rowTitle = {
            visibleTex: pdbEntityId,
            style: {
                fontWeight:"bold"
            }
        };
        this.pdbEntityTrack.hideEmptyTrackFlag = false;
        await this.buildChromosomeFv(chrId ?? this.chrSet[0]);
    }

    private async buildChromosomeFv(chrId: string): Promise<void> {
        this.plotChromosomeTitle(chrId);
        this.genomeSequenceTracks(chrId);
        this.nonExonConfigData.push(this.pdbEntityTrack);
        await this.plot();
        this.collectChromosomeEntityRegion(chrId);
    }

    private plotChromosomeTitle(chrId: string): void{
        document.getElementById(this.IDEOGRAM_DIV_ID)?.remove();
        document.getElementById(this.TITLE_CHR_DIV_ID)?.remove();
        this.currentDisplayedChrId = chrId;
        NcbiSummary.requestChromosomeData(chrId).then(ncbiChrResult=>{
            if(chrId == this.currentDisplayedChrId) {
                const ideogramDiv: HTMLDivElement = document.createElement<"div">("div");
                ideogramDiv.id = this.IDEOGRAM_DIV_ID;
                const titleDiv: HTMLDivElement = document.createElement<"div">("div");
                titleDiv.style.display = "inline-block";
                titleDiv.style.marginLeft = "20px";
                titleDiv.id = this.TITLE_CHR_DIV_ID;
                const title: HTMLSpanElement = document.createElement<"span">("span");
                title.innerHTML = ncbiChrResult.title;
                titleDiv.append(title);
                const region: HTMLSpanElement = document.createElement<"span">("span");
                region.id = this.TITLE_CHR_REGION_ID;
                region.innerHTML = " / Region: [" + this.entityBegin + " - " + this.entityEnd + "]";
                region.style.color = "#666";
                titleDiv.append(region);
                document.getElementById(this.elementSelectId)?.insertAdjacentElement("afterend", titleDiv);
                document.getElementById(this.elementId)?.insertAdjacentElement("beforebegin", ideogramDiv);
                this.plotIdeogram(ncbiChrResult);
            }
        });
    }

    private updateChromosomeTitleRegion(): void{
        const region: HTMLElement | null = document.getElementById(this.TITLE_CHR_REGION_ID);
        if(region != null)
            region.innerHTML = " / Region: ["+this.beginView+" - "+this.endView+"]";
    }

    private plotIdeogram(ncbiChrResult: ChromosomeMetadataInterface): void{
        NcbiSummary.requestTaxonomyData(ncbiChrResult.taxid.toString()).then(ncbiTaxResult=>{
            if(ncbiChrResult.ncbiId == this.currentDisplayedChrId) {
                const chrName: string = ncbiChrResult.subname.includes("|") ? ncbiChrResult.subname.split("|").filter(n=>{
                    return (n.match(/^([\dXYxy]+)$/) != null);
                })[0] : ncbiChrResult.subname;
                const ideogram = new Ideogram({
                    rotatable: false,
                    chrHeight: 1080,
                    chrWidth: 20,
                    organism: ncbiTaxResult.scientificname,
                    chromosomes: [chrName],
                    orientation: 'horizontal',
                    container: '#' + this.IDEOGRAM_DIV_ID,
                    annotationHeight: 8,
                    showBandLabels: true,
                    annotations: [{
                        name: this.entityId,
                        chr: chrName,
                        start: this.entityBegin,
                        stop: this.entityEnd
                    }],
                    onLoad: () => {
                        if (!(ideogram.chromosomesArray?.length > 0)) {
                            document.getElementById(this.IDEOGRAM_DIV_ID)?.remove();
                        } else {
                            const ideogram: HTMLElement | null = document.getElementById("_ideogram");
                            if (ideogram != null)
                                ideogram.style.padding = "0 0 0 0";
                        }
                    }
                });
            }
        });
    }

    private genomeSequenceTracks(chrId: string): void{
        this.nonExonConfigData.push({
            trackId: "mainSequenceTrack_5_" + chrId,
            displayType: RcsbFvDisplayTypes.SEQUENCE,
            trackColor: "#F9F9F9",
            displayColor: "#000000",
            nonEmptyDisplay: true,
            rowPrefix: chrId+" ",
            rowTitle: {
                visibleTex:"5'",
                style:{
                    fontWeight:"bold"
                },
            },
            titleFlagColor:RcsbAnnotationConstants.provenanceColorCode.external,
            updateDataOnMove: NcbiGenomeSequenceData.update(chrId, 1, false, this.rcsbFv.getBoardConfig().trackWidth)
        });

        this.nonExonConfigData.push({
            trackId: "mainSequenceTrack_3_" + chrId,
            displayType: RcsbFvDisplayTypes.SEQUENCE,
            trackColor: "#F9F9F9",
            displayColor: "#000000",
            rowPrefix:"",
            nonEmptyDisplay: true,
            rowTitle: {
                visibleTex:"3'",
                style:{
                    fontWeight:"bold"
                },
            },
            titleFlagColor:RcsbAnnotationConstants.provenanceColorCode.external,
            updateDataOnMove: NcbiGenomeSequenceData.update(chrId, 2, true, this.rcsbFv.getBoardConfig().trackWidth)
        });
    }


    private collectChromosomeEntityRegion(chrId: string): void{
        const begin: number | undefined = this.pdbEntityTrack.displayConfig?.[0].displayData?.[0].begin;
        const end: number | undefined = this.pdbEntityTrack.displayConfig?.[0].displayData?.[0].end;
        if(!(begin && end))
            return;
        const range: [number,number] = [Math.max(1, begin-5000000), end + 5000000];
        this.collectChromosomeAlignments(chrId, SequenceReference.Uniprot, range, 0);
        this.collectChromosomeAlignments(chrId, SequenceReference.NcbiProtein, range, 0);
    }

    private collectChromosomeAlignments(chrId: string, to: SequenceReference, range?:[number,number], index?: number): void {
        if(range && index){
            this.nTasks++;
            this.alignmentCollectorQueue.sendTask({
                queryId: chrId,
                from: SequenceReference.NcbiGenome,
                to: to,
                range: range
            }, async (e)=>{
                const ar: AlignmentResponse = e as AlignmentResponse
                await this.collectChromosomeWorkerResults(index,to,ar,false);
            });
        }else{
            for(let i=0;i<30;i++){
                this.nTasks++;
                this.alignmentCollectorQueue.sendTask({
                    queryId: chrId,
                    from: SequenceReference.NcbiGenome,
                    to: to,
                    range: [i*this.batchSize, (i+1)*this.batchSize]
                }, async (e)=>{
                    const ar: AlignmentResponse = e as AlignmentResponse
                    await this.collectChromosomeWorkerResults(i,to,ar,false);
                });
            }
        }
    }

    private async collectChromosomeWorkerResults(index: number, reference: SequenceReference, alignment: AlignmentResponse, forcePlot: boolean): Promise<void>{
        this.completeTasks++;
        this.targetAlignmentList.get(reference)![index] = alignment.target_alignment as TargetAlignment[];
        console.log("Completed "+Math.floor(this.completeTasks/this.nTasks*100)+"%");
        if(forcePlot){
            await this.plot();
        }else if(this.nTasks ==  this.completeTasks){
            console.log("All Tasks Completed. Starting Rendering");
            this.alignmentCollectorQueue.terminateWorkers();
            await this.plot();
        }
    }

    private collectExons(targetAlignmentList: TargetAlignment[], member: "query"|"target", blockColor: string, flagTitleColor: string, reference: SequenceReference, chrId?: string): RcsbFvRowConfigInterface[] {
        const exonTrackList: {data:RcsbFvTrackData;id:string;}[] = new Array<{data:RcsbFvTrackData;id:string;}>();
        targetAlignmentList.forEach((targetAlignment,i) => {
            if(targetAlignment.aligned_regions?.length == 0 || (member == "query" && this.targetFilterFlag && !this.targetCoverages.has(targetAlignment.target_id as string)) || (member == "target" && chrId != null && chrId != targetAlignment.target_id))
                return;
            exonTrackList.push({data:[this.normalizeTargetAlignment(targetAlignment, member)],id:targetAlignment.target_id as string});
        });
        const lightTracks: RcsbFvTrackData[] =  this.simplifyExonTracks(
            exonTrackList.sort((_a,_b)=>{
                const a: RcsbFvTrackData = _a.data;
                const b: RcsbFvTrackData = _b.data;
                if(a[0].begin != b[0].begin) return a[0].begin-b[0].begin;
                if(b[0].end != a[0].end) return (b[0].end as number)- (a[0].end as number);
                return (a[0].gaps?.map(g=>g.end-g.begin).reduce((a,b)=>a+b,0) ?? 0)- (b[0].gaps?.map(g=>g.end-g.begin).reduce((a,b)=>a+b,0) ?? 0);
            }).map(a=>{
                if(member == "target" && !this.chrSet.includes(a.id))
                    this.chrSet.push(a.id);
                return a.data;
            }),member,reference);
        return lightTracks.map((t,index)=>{
            return {
                trackId: "pdbTracks_" + Math.random().toString(36).substring(2),
                displayType: RcsbFvDisplayTypes.COMPOSITE,
                trackColor: "#F9F9F9",
                rowTitle: "",
                titleFlagColor: flagTitleColor,
                overlap: true,
                displayConfig:[{
                    displayType:RcsbFvDisplayTypes.BLOCK,
                    displayData:t,
                    displayColor:blockColor,
                    selectDataInRangeFlag: true,
                    hideEmptyTrackFlag: true,
                    minRatio: 1 / 5000
                }]
            }
        });
    }

    private normalizeTargetAlignment(targetAlignment: TargetAlignment, member: "query"|"target"): RcsbFvTrackDataElementInterface {
        const beginMember: "query_begin"|"target_begin" = member === "query" ? "query_begin" : "target_begin";
        const endMember: "query_end"|"target_end" = member === "query" ? "query_end" : "target_end";
        const out: RcsbFvTrackDataElementInterface = {
            begin: Math.min(
                targetAlignment.aligned_regions?.[0]?.[beginMember] as number,
                targetAlignment.aligned_regions?.[targetAlignment.aligned_regions.length-1]?.[endMember] as number
            ),
            end: Math.max(
                targetAlignment.aligned_regions?.[0]?.[beginMember] as number
                ,targetAlignment.aligned_regions?.[targetAlignment.aligned_regions.length-1]?.[endMember] as number
            ),
            gaps: [],
            description:[targetAlignment.target_id as string],
            openBegin: (targetAlignment.orientation as number)< 0,
            openEnd: (targetAlignment.orientation as number) > 0
        };
        if((targetAlignment.orientation as number)>0) {
            if(member == "query" && (targetAlignment.aligned_regions?.[targetAlignment.aligned_regions.length-1]?.[endMember] as number) > this.maxRange)
                this.maxRange = targetAlignment.aligned_regions?.[targetAlignment.aligned_regions.length-1]?.[endMember] as number;
            if(member == "query" && (targetAlignment.aligned_regions?.[0]?.[beginMember] as number)< this.minRange)
                this.minRange = targetAlignment.aligned_regions?.[0]?.[beginMember] as number;
            targetAlignment.aligned_regions?.forEach((currentExon,n) => {
                if((n+1)<(targetAlignment.aligned_regions?.length as number)){
                    const nextExon: AlignedRegion = targetAlignment.aligned_regions?.[n+1] as AlignedRegion;
                    let beginGap: number = currentExon?.[endMember] as number;
                    let endGap: number = nextExon[beginMember];
                    const exonShift: number[] = currentExon?.exon_shift as number[];
                    if(exonShift.length == 1){
                        if( Math.abs(exonShift[0]-endGap) == 1 ){
                            endGap = exonShift[0];
                        }else{
                            out.gaps?.push({
                                end:exonShift[0],
                                begin: beginGap,
                                isConnected: true
                            });
                            endGap = exonShift[0];
                        }
                    }else if(exonShift.length == 2){
                        if( Math.abs(exonShift[1]-endGap) == 1 && Math.abs(exonShift[1]-exonShift[0]) == 1){
                            endGap = exonShift[0];
                        }else if( Math.abs(exonShift[1]-endGap) == 1 ){
                            out.gaps?.push({
                                end:exonShift[0],
                                begin: beginGap,
                                isConnected: true
                            });
                            beginGap = exonShift[0];
                            endGap = exonShift[1];
                        }else if( Math.abs(exonShift[1]-exonShift[0]) == 1 ){
                            out.gaps?.push({
                                end:exonShift[0],
                                begin: beginGap,
                                isConnected: true
                            });
                            beginGap = exonShift[1];
                        }else{
                            out.gaps?.push({
                                end:exonShift[0],
                                begin: beginGap,
                                isConnected: true
                            });
                            beginGap = exonShift[0];
                            out.gaps?.push({
                                end:exonShift[1],
                                begin: beginGap,
                                isConnected: true
                            });
                            beginGap = exonShift[1];
                        }
                    }
                    out.gaps?.push({
                        begin: beginGap,
                        end: endGap,
                        isConnected: true
                    });
                }
            });
        }else{
            if(member == "query" && (targetAlignment.aligned_regions?.[0]?.[beginMember] as number)>this.maxRange)
                this.maxRange = targetAlignment.aligned_regions?.[0]?.[beginMember] as number;
            if(member == "query" && (targetAlignment.aligned_regions?.[targetAlignment.aligned_regions.length-1]?.[endMember] as number) < this.minRange)
                this.minRange = targetAlignment.aligned_regions?.[targetAlignment.aligned_regions.length-1]?.[endMember] as number;
            targetAlignment.aligned_regions?.reverse().forEach((currentExon,n) => {
                if((n+1)<(targetAlignment.aligned_regions?.length as number)) {
                    const nextExon: AlignedRegion = targetAlignment.aligned_regions?.[n + 1] as AlignedRegion;
                    let beginGap: number = currentExon?.[beginMember] as number;
                    const endGap: number = nextExon[endMember];
                    const exonShift: number[] = nextExon.exon_shift as number[];

                    if(exonShift.length == 1){
                        if( Math.abs(exonShift[0]-beginGap) == 1 ){
                            beginGap = exonShift[0];
                        }else{
                            out.gaps?.push({
                                end: exonShift[0],
                                begin: beginGap,
                                isConnected: true
                            });
                            beginGap = exonShift[0];
                        }
                    }else if(exonShift.length == 2){
                        if( Math.abs(exonShift[1]-beginGap) == 1  && Math.abs(exonShift[1]-exonShift[0]) == 1 ){
                            beginGap = exonShift[0];
                        }else if( Math.abs(exonShift[1]-beginGap) == 1 ){
                            beginGap = exonShift[1];
                            out.gaps?.push({
                                end: exonShift[0],
                                begin: beginGap,
                                isConnected: true
                            });
                            beginGap = exonShift[0];
                        }else if( Math.abs(exonShift[1]-exonShift[0]) == 1 ){
                            out.gaps?.push({
                                end: exonShift[0],
                                begin: beginGap,
                                isConnected: true
                            });
                            beginGap = exonShift[1];
                        }else{
                            out.gaps?.push({
                                end: exonShift[0],
                                begin: beginGap,
                                isConnected: true
                            });
                            beginGap = exonShift[0];
                            out.gaps?.push({
                                end: exonShift[1],
                                begin: beginGap,
                                isConnected: true
                            });
                            beginGap = exonShift[1];
                        }
                    }
                    out.gaps?.push({
                        end: endGap,
                        begin: beginGap,
                        isConnected: true
                    });
                }
            });
        }
        return out;
    }

    private simplifyExonTracks(tracks: RcsbFvTrackData[], member: "query"|"target", reference: SequenceReference): RcsbFvTrackData[] {
        const lightTracks: RcsbFvTrackData[] = new Array<RcsbFvTrackData>();
        tracks.forEach(t=>{
            const trackBegin: number = t[0].begin;
            const trackEnd: number = t[0].end as number;

            if(lightTracks.length == 0){
                if( (this.entityBegin > 0 && this.entityEnd > 0) && !(trackBegin > this.entityEnd || trackEnd < this.entityBegin) ){
                    if(trackBegin<this.beginView)
                        this.beginView = trackBegin;
                    if(trackEnd>this.endView)
                        this.endView = trackEnd;
                }
                lightTracks.push(t);
            }else{
                const N: number = lightTracks.length-1;
                const begin: number = lightTracks[N][0].begin;
                const end: number = lightTracks[N][0].end as number;
                const trackHash: string = trackBegin+"."+t[0].gaps?.map((b)=>{return b.begin+"."+b.end}).join(".")+"."+trackEnd;
                const ltHash: string = begin+"."+lightTracks[N][0].gaps?.map((b)=>{return b.begin+"."+b.end}).join(".")+"."+end;
                if( trackHash != ltHash ){
                    if( (this.entityBegin > 0 && this.entityEnd > 0) && !(trackBegin > this.entityEnd || trackEnd < this.entityBegin) ){
                        if(trackBegin<this.beginView)
                            this.beginView = trackBegin;
                        if(trackEnd>this.endView)
                            this.endView = trackEnd;
                    }
                    lightTracks.push(t);
                }else{
                    lightTracks[N][0].description?.push(t[0]?.description?.[0] as string);
                }
            }
        });
        return lightTracks;
    }

    private mergeExonTracks(tracks: RcsbFvRowConfigInterface[], reference: SequenceReference): RcsbFvRowConfigInterface[] {
        const lightTracks: RcsbFvRowConfigInterface[] = new Array<RcsbFvRowConfigInterface>();
        tracks.forEach(t=>{
            if(lightTracks.length == 0){
                lightTracks.push(t);
            }else{
                const trackBegin: number = t.displayConfig?.[0].displayData?.[0].begin as number;
                let index = -1;
                lightTracks.forEach((lT,n)=>{
                    const N: number = (lT.displayConfig?.[0].displayData?.length as number)-1;
                    const end: number = lT.displayConfig?.[0].displayData?.[N].end as number;
                    if(trackBegin > end && index == -1){
                        index = n;
                    }
                });
                if(index>=0){
                    lightTracks[index]?.displayConfig?.[0].displayData?.push(t.displayConfig?.[0].displayData?.[0] as RcsbFvTrackDataElementInterface);
                }else if(index == -1){
                    lightTracks.push(t);
                }
            }
        });
        this.addSequences(lightTracks, reference);
        return lightTracks;
    }

    private addSequences(lightTracks: RcsbFvRowConfigInterface[], reference: SequenceReference): void{
        lightTracks.forEach(t=>{
            const ids: Map<[number,number], string> = new Map<[number, number], string>();
            t.displayConfig?.[0].displayData?.forEach(d=>{
                ids.set([d.begin,d.end as number],d.description?.[0] as string);
            })
            t.displayConfig?.push({
                displayType: RcsbFvDisplayTypes.SEQUENCE,
                updateDataOnMove: sequenceDisplayDynamicUpdate(reference, ids, this.rcsbFv.getBoardConfig().trackWidth),
                displayData: [],
                hideEmptyTrackFlag: true,
                minRatio: 1 / 1000
            });
        });
    }

    private async setDisplayView(): Promise<void>{
        if(this.entityBegin == 0 && this.entityEnd == 0 && (this.pdbEntityTrack.displayConfig?.length as number) > 0 ){
            const lastIndex: number = (this.pdbEntityTrack.displayConfig?.[0].displayData?.length as number)-1;
            this.entityBegin = this.pdbEntityTrack.displayConfig?.[0].displayData?.[0].begin as number;
            this.entityEnd = this.pdbEntityTrack.displayConfig?.[0].displayData?.[lastIndex].end as number;
            this.beginView = this.pdbEntityTrack.displayConfig?.[0].displayData?.[0].begin as number;
            this.endView = this.pdbEntityTrack.displayConfig?.[0].displayData?.[lastIndex].end as number;
            const begin: number = this.beginView;
            const end: number = this.endView;
            const length = end - begin;
            this.boardConfigData.range = {
                min:begin - Math.ceil(0.05*length),
                max:end + Math.ceil(+0.05*length)
            };
        }else if((this.pdbEntityTrack.displayConfig?.length as number) > 0){
            this.beginView = this.minRange;
            this.endView = this.maxRange;
            const begin: number = this.beginView;
            const end: number = this.endView;
            const length = end - begin;
            this.boardConfigData.range = {
                min:begin - Math.ceil(0.05*length),
                max:end + Math.ceil(+0.05*length)
            };
            this.updateChromosomeTitleRegion();
        }
        await this.display();
        return void 0;
    }

    private async plot(): Promise<void>{
        console.log("PROCESSING");
        let tracks: RcsbFvRowConfigInterface[] = new Array<RcsbFvRowConfigInterface>();

        let ncbiTracks: RcsbFvRowConfigInterface[] = new Array<RcsbFvRowConfigInterface>();
        this.targetAlignmentList.get(SequenceReference.NcbiProtein)?.forEach((tA, index)=>{
            if(tA.length>0) {
                ncbiTracks = ncbiTracks.concat(this.collectExons(tA, "query", "#69b3a2", "#69b3a2", SequenceReference.NcbiProtein));
            }
        });
        ncbiTracks = this.mergeExonTracks(ncbiTracks, SequenceReference.NcbiProtein);

        let uniprotTracks: RcsbFvRowConfigInterface[] = new Array<RcsbFvRowConfigInterface>();
        this.targetAlignmentList.get(SequenceReference.Uniprot)?.forEach((tA, index)=>{
            if(tA.length>0)
                uniprotTracks = uniprotTracks.concat( this.collectExons(tA,"query", "#cc99ff","#cc99ff", SequenceReference.Uniprot) );
        });
        uniprotTracks = this.mergeExonTracks(uniprotTracks, SequenceReference.Uniprot);

        let entityTracks: RcsbFvRowConfigInterface[] = new Array<RcsbFvRowConfigInterface>();
        this.targetAlignmentList.get(SequenceReference.PdbEntity)?.forEach((tA, index)=>{
            if(tA.length>0)
                entityTracks = entityTracks.concat( this.collectExons(tA,"query", RcsbAnnotationConstants.provenanceColorCode.rcsbPdb, RcsbAnnotationConstants.provenanceColorCode.rcsbPdb, SequenceReference.PdbEntity) );
        });
        entityTracks = this.mergeExonTracks(entityTracks, SequenceReference.PdbEntity);

        if(ncbiTracks.length > 0) {
            tracks = tracks.concat(ncbiTracks);
            ncbiTracks[0].rowTitle = "NCBI PROTEINS";
        }
        if(uniprotTracks.length > 0) {
            tracks = tracks.concat(uniprotTracks);
            uniprotTracks[0].rowTitle = "UNIPROT PROTEINS";
        }
        if(entityTracks.length > 0) {
            tracks = tracks.concat(entityTracks)
            entityTracks[0].rowTitle = "PDB ENTITIES";
        }

        const headerTracks: RcsbFvRowConfigInterface[] = this.featuresConfigData.length > 0 ? this.nonExonConfigData.concat(this.featuresConfigData) : this.nonExonConfigData;
        if(tracks.length > 0)
            this.rowConfigData = headerTracks.concat(tracks);
        else
            this.rowConfigData = headerTracks;
        console.log("RENDERING");
        this.boardConfigData.hideInnerBorder = true;
        this.boardConfigData.length = Math.floor(this.maxRange + 0.01*this.maxRange);
        this.boardConfigData.includeAxis = true;
        await this.setDisplayView();
        this.buildSubject.next(void 0);
        this.targetsSubject.next(this.chrSet);
        return void 0;
    }

    protected async protectedBuild(): Promise<void> {
        const buildConfig: RcsbFvModuleBuildInterface = this.buildConfig;
        return new Promise<void>(((resolve, reject) => {
            ObservableHelper.oneTimeSubscription<void>(resolve, this.buildSubject);
            if(buildConfig.elementSelectId)
                this.elementSelectId = buildConfig.elementSelectId;
            if(buildConfig.entityId != null)
                this.buildPdbGenomeFv(buildConfig.entityId, buildConfig.chrId);
            else if(buildConfig.chrId != null)
                this.buildFullGenomeRangeFv(buildConfig.chrId);
        }));

    }

    public async getTargets(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject)=>{
            if(this.chrSet.length > 0)
                resolve(this.chrSet);
            else
                ObservableHelper.oneTimeSubscription<string[]>(resolve, this.targetsSubject);
        });
    }

    protected concatAlignmentAndAnnotationTracks(): void {
    }

}


