import {RcsbFvCore} from "./RcsbFvCore";
import {
    AlignedRegion,
    AlignmentResponse,
    Coverage,
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
import {RcsbQueryAlignment} from "../../RcsbGraphQL/RcsbQueryAlignment";
import {UpdateGenomeSequenceData} from "../Utils/UpdateGenomeSequenceData";

function sequenceDisplayDynamicUpdate( reference:SequenceReference, ranges: Map<[number,number],string>, trackWidth?: number): ((where: RcsbFvLocationViewInterface) => Promise<RcsbFvTrackData>){
    return (where: RcsbFvLocationViewInterface) => {
        const delta: number = trackWidth ? trackWidth / (where.to - where.from) : 1000 / (where.to - where.from);
        if (delta > 4) {
            const ids: Array<string> = new Array<string>();
            ranges.forEach((id, r) => {
                if (!(r[0] > where.to || r[1] < where.from))
                    ids.push(id);
            });
            return Promise.all(ids.map(id => {
                const queryAlignment: RcsbQueryAlignment = new RcsbQueryAlignment();
                return queryAlignment.request({
                    queryId: id,
                    from: reference,
                    to: SequenceReference.NcbiGenome
                });
            })).then(alignments => {
                const out: RcsbFvTrackData = new RcsbFvTrackData();
                alignments.forEach((a,n) => {
                    const sequence: Array<string> = a.query_sequence.split("");
                    a.target_alignment.forEach(ta => {
                        const orientation = ta.orientation;
                        ta.aligned_regions.forEach(r => {
                            const targetIndex: number = r.target_begin
                            const queryIndex: number = r.query_begin
                            const length: number = r.query_end - r.query_begin + 1;
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
                resolve(null);
            });
        }
    };
}

export class RcsbFvChromosome extends RcsbFvCore implements RcsbFvModuleInterface {
    private readonly targetAlignmentList: Map<SequenceReference,Array<Array<TargetAlignment>>> = new Map<SequenceReference, Array<Array<TargetAlignment>>>([
        [SequenceReference.NcbiProtein, new Array<Array<TargetAlignment>>()],
        [SequenceReference.Uniprot, new Array<Array<TargetAlignment>>()],
        [SequenceReference.PdbEntity, new Array<Array<TargetAlignment>>()]
    ]);

    private maxRange: number = 0;
    private alignmentCollectorQueue: RcsbFvAlignmentCollectorQueue = new RcsbFvAlignmentCollectorQueue(12);
    private nTasks: number = 0;
    private completeTasks: number = 0;
    private pdbEntityTrack:  RcsbFvRowConfigInterface;
    private batchSize: number = 10000000;
    private beginView: number = 0;
    private endView: number = 0;
    private entityBegin: number = 0;
    private entityEnd: number = 0;
    private nonExonConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private featuresConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private targetCoverages: Map<String, Coverage> = new Map<String, Coverage>();
    private chrSet: Map<string,{index:number;length:number;}> = new Map<string, {index: number; length: number}>();
    private targetFilterFlag: boolean = true;

    private buildPdbGenomeFv(pdbEntityId: string, chrId?: string){
        const queryAlignment: RcsbQueryAlignment = new RcsbQueryAlignment();
        Promise.all([SequenceReference.NcbiProtein, SequenceReference.Uniprot].map(to=>{
            return queryAlignment.request({
                queryId: pdbEntityId,
                from: SequenceReference.PdbEntity,
                to: to
            });
        })).then(result=>{
            result.forEach(a=>{
                a.target_alignment.forEach(ta=>{
                    this.targetCoverages.set(ta.target_id, ta.coverage);
                });
            });
            this.alignmentCollectorQueue.sendTask({
                queryId: pdbEntityId,
                from: SequenceReference.PdbEntity,
                to: SequenceReference.NcbiGenome,
            }, (e)=>{
                const ar: AlignmentResponse = e as AlignmentResponse
                this.collectPdbWorkerResults(ar, pdbEntityId, chrId);
            });
        });
    }

    private buildFullGenomeRangeFv(chrId: string){
        this.targetFilterFlag = false;
        this.genomeSequenceTracks(chrId);
        this.collectChromosomeAlignments(chrId, SequenceReference.PdbEntity);
        this.collectChromosomeAlignments(chrId, SequenceReference.Uniprot);
        this.collectChromosomeAlignments(chrId, SequenceReference.NcbiProtein);
    }

    private collectPdbWorkerResults(ar: AlignmentResponse, pdbEntityId: string, chrId?: string){
         const exonTracks: Array<RcsbFvRowConfigInterface> = this.collectExons(
            ar.target_alignment,
            "target",
            RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
            RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
            "",
            SequenceReference.PdbEntity,
            chrId
        );
        const index:number = chrId != null ? 0 : Array.from(this.chrSet.entries()).sort((a,b)=>{
            if(b[1].length>a[1].length)
                return b[1].length-a[1].length;
            else
                return b[1].index-a[1].index;
        })[0][1].index;
        this.pdbEntityTrack = exonTracks[index];
        this.pdbEntityTrack.displayConfig[0].displayData[0].description = [pdbEntityId];
        this.addSequences([this.pdbEntityTrack],SequenceReference.PdbEntity);
        this.pdbEntityTrack.rowPrefix = SequenceReference.PdbEntity.replace("_"," ");
        this.pdbEntityTrack.rowTitle = {
            visibleTex: pdbEntityId,
            style: {
                fontWeight:"bold"
            }
        };
        this.pdbEntityTrack.hideEmptyTrackFlag = false;
        this.buildChromosomeFv(chrId ?? ar.target_alignment[index].target_id);
    }

    private buildChromosomeFv(chrId: string): void {
        this.genomeSequenceTracks(chrId);
        this.nonExonConfigData.push(this.pdbEntityTrack);
        this.plot();
        this.collectChromosomeEntityRegion(chrId);
    }

    private genomeSequenceTracks(chrId: string): void{
        const updateGenomeSequence_5: UpdateGenomeSequenceData = new UpdateGenomeSequenceData();
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
            updateDataOnMove: updateGenomeSequence_5.update(chrId, 1, false, this.rcsbFv?.getBoardConfig()?.trackWidth)
        });

        const updateGenomeSequence_3: UpdateGenomeSequenceData = new UpdateGenomeSequenceData();
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
            updateDataOnMove: updateGenomeSequence_3.update(chrId, 2, true, this.rcsbFv?.getBoardConfig()?.trackWidth)
        });
    }


    private collectChromosomeEntityRegion(chrId: string): void{
        const begin: number = this.pdbEntityTrack.displayConfig[0].displayData[0].begin;
        const end: number = this.pdbEntityTrack.displayConfig[0].displayData[0].end;
        const length = end - begin;
        const range: [number,number] = [begin - Math.ceil(0.05*length), end + Math.ceil(+0.05*length)];
        this.collectChromosomeAlignments(chrId, SequenceReference.Uniprot, range, 0);
        this.collectChromosomeAlignments(chrId, SequenceReference.NcbiProtein, range, 0);
    }

    private collectChromosomeAlignments(chrId: string, to: SequenceReference, range?:[number,number], index?: number) {
        if(range != null){
            this.nTasks++;
            this.alignmentCollectorQueue.sendTask({
                queryId: chrId,
                from: SequenceReference.NcbiGenome,
                to: to,
                range: range
            }, (e)=>{
                const ar: AlignmentResponse = e as AlignmentResponse
                this.collectChromosomeWorkerResults(index,to,ar,false);
            });
        }else{
            for(let i=0;i<30;i++){
                this.nTasks++;
                this.alignmentCollectorQueue.sendTask({
                    queryId: chrId,
                    from: SequenceReference.NcbiGenome,
                    to: to,
                    range: [i*this.batchSize, (i+1)*this.batchSize]
                }, (e)=>{
                    const ar: AlignmentResponse = e as AlignmentResponse
                    this.collectChromosomeWorkerResults(i,to,ar,false);
                });
            }
        }
    }

    private collectChromosomeWorkerResults(index: number, reference: SequenceReference, alignment: AlignmentResponse, forcePlot: boolean): void{
        this.completeTasks++;
        this.targetAlignmentList.get(reference)[index] = alignment.target_alignment;
        console.log("Completed "+Math.floor(this.completeTasks/this.nTasks*100)+"%");
        if(forcePlot){
            this.plot();
        }else if(this.nTasks ==  this.completeTasks){
            console.log("All Tasks Completed. Starting Rendering");
            this.alignmentCollectorQueue.terminateWorkers();
            this.plot();
        }
    }

    private collectExons(targetAlignmentList: Array<TargetAlignment>, member: "query"|"target", blockColor: string, flagTitleColor: string, title: string, reference: SequenceReference, chrId?: string): Array<RcsbFvRowConfigInterface> {
        const exonTrackList: Array<RcsbFvTrackData> = new Array<RcsbFvTrackData>();
        targetAlignmentList.forEach((targetAlignment,i) => {
            if(member == "target" && chrId == null)
                this.chrSet.set(targetAlignment.target_id,{index:i,length:targetAlignment.aligned_regions.length});
            if(targetAlignment.aligned_regions.length == 0 || (member == "query" && this.targetFilterFlag && !this.targetCoverages.has(targetAlignment.target_id)) || (member == "target" && chrId != null && chrId != targetAlignment.target_id))
                return;
            exonTrackList.push([this.normalizeTargetAlignment(targetAlignment, member)]);
        });
        const lightTracks: Array<RcsbFvTrackData> =  this.simplifyExonTracks(exonTrackList.sort((a,b)=>{
            if(a[0].begin != b[0].begin) return a[0].begin-b[0].begin;
            if(b[0].end != a[0].end) return b[0].end-a[0].end;
            return a[0].gaps.map(g=>g.end-g.begin).reduce((a,b)=>a+b,0)-b[0].gaps.map(g=>g.end-g.begin).reduce((a,b)=>a+b,0);
        }),member,reference);
        return lightTracks.map((t,index)=>{
            return {
                trackId: "pdbTracks_" + Math.random().toString(36).substr(2),
                displayType: RcsbFvDisplayTypes.COMPOSITE,
                trackColor: "#F9F9F9",
                rowTitle: index == 0 ? title : "",
                titleFlagColor: flagTitleColor,
                overlap: true,
                displayConfig:[{
                    displayType:RcsbFvDisplayTypes.BLOCK,
                    displayData:t,
                    displayColor:blockColor,
                    selectDataInRangeFlag: true,
                    hideEmptyTrackFlag: true,
                    minRatio: 1 / 1000
                }]
            }
        });
    }

    private normalizeTargetAlignment(targetAlignment: TargetAlignment, member: "query"|"target"): RcsbFvTrackDataElementInterface {
        const beginMember: "query_begin"|"target_begin" = member === "query" ? "query_begin" : "target_begin";
        const endMember: "query_end"|"target_end" = member === "query" ? "query_end" : "target_end";
        const out: RcsbFvTrackDataElementInterface = {
            begin: Math.min(targetAlignment.aligned_regions[0][beginMember],targetAlignment.aligned_regions[targetAlignment.aligned_regions.length-1][endMember]),
            end: Math.max(targetAlignment.aligned_regions[0][beginMember],targetAlignment.aligned_regions[targetAlignment.aligned_regions.length-1][endMember]),
            gaps: [],
            description:[targetAlignment.target_id],
            openBegin: targetAlignment.orientation < 0,
            openEnd: targetAlignment.orientation > 0
        };
        if(targetAlignment.orientation>0) {
            if(targetAlignment.aligned_regions[targetAlignment.aligned_regions.length-1][endMember] > this.maxRange)
                this.maxRange = targetAlignment.aligned_regions[targetAlignment.aligned_regions.length-1][endMember];
            targetAlignment.aligned_regions.forEach((currentExon,n) => {
                if((n+1)<targetAlignment.aligned_regions.length){
                    const nextExon: AlignedRegion = targetAlignment.aligned_regions[n+1];
                    let beginGap: number = currentExon[endMember];
                    let endGap: number = nextExon[beginMember];
                    const exonShift: Array<number> = currentExon.exon_shift;
                    if(exonShift?.length == 1){
                        if( Math.abs(exonShift[0]-endGap) == 1 ){
                            endGap = exonShift[0];
                        }else{
                            out.gaps.push({
                                end:exonShift[0],
                                begin: beginGap,
                                isConnected: true
                            });
                            endGap = exonShift[0];
                        }
                    }else if(exonShift?.length == 2){
                        if( Math.abs(exonShift[1]-endGap) == 1 && Math.abs(exonShift[1]-exonShift[0]) == 1){
                            endGap = exonShift[0];
                        }else if( Math.abs(exonShift[1]-endGap) == 1 ){
                            out.gaps.push({
                                end:exonShift[0],
                                begin: beginGap,
                                isConnected: true
                            });
                            beginGap = exonShift[0];
                            endGap = exonShift[1];
                        }else if( Math.abs(exonShift[1]-exonShift[0]) == 1 ){
                            out.gaps.push({
                                end:exonShift[0],
                                begin: beginGap,
                                isConnected: true
                            });
                            beginGap = exonShift[1];
                        }else{
                            out.gaps.push({
                                end:exonShift[0],
                                begin: beginGap,
                                isConnected: true
                            });
                            beginGap = exonShift[0];
                            out.gaps.push({
                                end:exonShift[1],
                                begin: beginGap,
                                isConnected: true
                            });
                            beginGap = exonShift[1];
                        }
                    }
                    out.gaps.push({
                        begin: beginGap,
                        end: endGap,
                        isConnected: true
                    });
                }
            });
        }else{
            if(targetAlignment.aligned_regions[0][beginMember]>this.maxRange)
                this.maxRange = targetAlignment.aligned_regions[0][beginMember];
            targetAlignment.aligned_regions.reverse().forEach((currentExon,n) => {
                if((n+1)<targetAlignment.aligned_regions.length) {
                    const nextExon: AlignedRegion = targetAlignment.aligned_regions[n + 1];
                    let beginGap: number = currentExon[beginMember];
                    let endGap: number = nextExon[endMember];
                    const exonShift: Array<number> = nextExon.exon_shift;

                    if(exonShift?.length == 1){
                        if( Math.abs(exonShift[0]-beginGap) == 1 ){
                            beginGap = exonShift[0];
                        }else{
                            out.gaps.push({
                                end: exonShift[0],
                                begin: beginGap,
                                isConnected: true
                            });
                            beginGap = exonShift[0];
                        }
                    }else if(exonShift?.length == 2){
                        if( Math.abs(exonShift[1]-beginGap) == 1  && Math.abs(exonShift[1]-exonShift[0]) == 1 ){
                            beginGap = exonShift[0];
                        }else if( Math.abs(exonShift[1]-beginGap) == 1 ){
                            beginGap = exonShift[1];
                            out.gaps.push({
                                end: exonShift[0],
                                begin: beginGap,
                                isConnected: true
                            });
                            beginGap = exonShift[0];
                        }else if( Math.abs(exonShift[1]-exonShift[0]) == 1 ){
                            out.gaps.push({
                                end: exonShift[0],
                                begin: beginGap,
                                isConnected: true
                            });
                            beginGap = exonShift[1];
                        }else{
                            out.gaps.push({
                                end: exonShift[0],
                                begin: beginGap,
                                isConnected: true
                            });
                            beginGap = exonShift[0];
                            out.gaps.push({
                                end: exonShift[1],
                                begin: beginGap,
                                isConnected: true
                            });
                            beginGap = exonShift[1];
                        }
                    }
                    out.gaps.push({
                        end: endGap,
                        begin: beginGap,
                        isConnected: true
                    });
                }
            });
        }
        return out;
    }

    private simplifyExonTracks(tracks: Array<RcsbFvTrackData>, member: "query"|"target", reference: SequenceReference): Array<RcsbFvTrackData> {
        const lightTracks: Array<RcsbFvTrackData> = new Array<RcsbFvTrackData>();
        tracks.forEach(t=>{
            const trackBegin: number = t[0].begin;
            const trackEnd: number = t[0].end;

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
                const end: number = lightTracks[N][0].end;
                const trackHash: string = trackBegin+"."+t[0].gaps.map((b)=>{return b.begin+"."+b.end}).join(".")+"."+trackEnd;
                const ltHash: string = begin+"."+lightTracks[N][0].gaps.map((b)=>{return b.begin+"."+b.end}).join(".")+"."+end;
                if( trackHash != ltHash ){
                    if( (this.entityBegin > 0 && this.entityEnd > 0) && !(trackBegin > this.entityEnd || trackEnd < this.entityBegin) ){
                        if(trackBegin<this.beginView)
                            this.beginView = trackBegin;
                        if(trackEnd>this.endView)
                            this.endView = trackEnd;
                    }
                    lightTracks.push(t);
                }else{
                    lightTracks[N][0].description.push(t[0].description[0]);
                }
            }
        });
        return lightTracks;
    }

    private mergeExonTracks(tracks: Array<RcsbFvRowConfigInterface>, reference: SequenceReference): Array<RcsbFvRowConfigInterface> {
        const lightTracks: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
        tracks.forEach(t=>{
            if(lightTracks.length == 0){
                lightTracks.push(t);
            }else{
                const trackBegin: number = t.displayConfig[0].displayData[0].begin;
                let index: number = -1;
                lightTracks.forEach((lT,n)=>{
                    const N: number = lT.displayConfig[0].displayData.length-1;
                    const end: number = lT.displayConfig[0].displayData[N].end;
                    if(trackBegin > end && index == -1){
                        index = n;
                    }
                });
                if(index>=0){
                    lightTracks[index].displayConfig[0].displayData.push(t.displayConfig[0].displayData[0]);
                }else if(index == -1){
                    lightTracks.push(t);
                }
            }
        });
        this.addSequences(lightTracks, reference);
        return lightTracks;
    }

    private addSequences(lightTracks: Array<RcsbFvRowConfigInterface>, reference: SequenceReference): void{
        lightTracks.forEach(t=>{
            const ids: Map<[number,number], string> = new Map<[number, number], string>();
            t.displayConfig[0].displayData.forEach(d=>{
                ids.set([d.begin,d.end],d.description[0]);
            })
            t.displayConfig.push({
                displayType: RcsbFvDisplayTypes.SEQUENCE,
                updateDataOnMove: sequenceDisplayDynamicUpdate(reference, ids, this.rcsbFv?.getBoardConfig()?.trackWidth),
                displayData: [],
                hideEmptyTrackFlag: true,
                minRatio: 1 / 1000
            });
        });
    }

    private setDisplayView(): void{
        if(this.entityBegin == 0 && this.entityEnd == 0 && this.pdbEntityTrack?.displayConfig?.length > 0 ){
            this.entityBegin = this.pdbEntityTrack.displayConfig[0].displayData[0].begin;
            this.entityEnd = this.pdbEntityTrack.displayConfig[0].displayData[0].end;
            this.beginView = this.pdbEntityTrack.displayConfig[0].displayData[0].begin;
            this.endView = this.pdbEntityTrack.displayConfig[0].displayData[0].end;
            const begin: number = this.beginView;
            const end: number = this.endView;
            const length = end - begin;
            this.boardConfigData.range = {
                min:begin - Math.ceil(0.05*length),
                max:end + Math.ceil(+0.05*length)
            };
        }
        this.display();
    }

    private plot(): void{
        console.log("PROCESSING");
        let tracks: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();

        let ncbiTracks: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
        this.targetAlignmentList.get(SequenceReference.NcbiProtein).forEach((tA, index)=>{
            if(tA.length>0)
                ncbiTracks = ncbiTracks.concat( this.collectExons(tA,"query", "#69b3a2","#69b3a2", "NCBI PROTEINS", SequenceReference.NcbiProtein) );
        });
        ncbiTracks = this.mergeExonTracks(ncbiTracks, SequenceReference.NcbiProtein);

        let uniprotTracks: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
        this.targetAlignmentList.get(SequenceReference.Uniprot).forEach((tA, index)=>{
            if(tA.length>0)
                uniprotTracks = uniprotTracks.concat( this.collectExons(tA,"query", "#cc99ff","#cc99ff", "UNIPROT PROTEINS", SequenceReference.Uniprot) );
        });
        uniprotTracks = this.mergeExonTracks(uniprotTracks, SequenceReference.Uniprot);

        let entityTracks: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
        this.targetAlignmentList.get(SequenceReference.PdbEntity).forEach((tA, index)=>{
            if(tA.length>0)
                entityTracks = entityTracks.concat( this.collectExons(tA,"query", RcsbAnnotationConstants.provenanceColorCode.rcsbPdb, RcsbAnnotationConstants.provenanceColorCode.rcsbPdb, "PDB ENTITIES", SequenceReference.PdbEntity) );
        });
        entityTracks = this.mergeExonTracks(entityTracks, SequenceReference.PdbEntity);

        const headerTracks: Array<RcsbFvRowConfigInterface> = this.featuresConfigData?.length > 0 ? this.nonExonConfigData.concat(this.featuresConfigData) : this.nonExonConfigData;
        if(ncbiTracks.length > 0)
            tracks = tracks.concat(ncbiTracks);
        if(uniprotTracks.length > 0)
            tracks = tracks.concat(uniprotTracks);
        if(entityTracks.length > 0)
            tracks = tracks.concat(entityTracks)

        if(tracks.length > 0)
            this.rowConfigData = headerTracks.concat(tracks);
        else
            this.rowConfigData = headerTracks;
        console.log("RENDERING");
        this.boardConfigData.borderColor = "#F9F9F9";
        this.boardConfigData.length = Math.floor(this.maxRange + 0.01*this.maxRange);
        this.boardConfigData.includeAxis = true;
        this.setDisplayView();
    }

    public build(buildConfig: RcsbFvModuleBuildInterface): void {
        if(buildConfig.entityId != null)
            this.buildPdbGenomeFv(buildConfig.entityId, buildConfig.chrId);
        else if(buildConfig.chrId != null)
            this.buildFullGenomeRangeFv(buildConfig.chrId);
    }

    public getTargets(): Promise<Array<string>> {
        return new Promise((resolve, reject)=>{
            const recursive = ()=>{
                if(this.chrSet.size > 0)
                    resolve(Array.from(this.chrSet.entries()).sort((a,b)=>{
                        if(b[1].length>a[1].length)
                            return b[1].length-a[1].length;
                        else
                            return b[1].index-a[1].index;
                    }).map(a=>{
                        return a[0]
                    }));
                else
                    window.setTimeout(()=>{
                        recursive();
                    },600);
            };
            recursive();
        });
    }
}
