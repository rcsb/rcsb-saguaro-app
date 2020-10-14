import {RcsbFvCore} from "./RcsbFvCore";
import {
    AlignmentResponse, FieldName, FilterInput, OperationType,
    SequenceReference, Source,
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

function updateData(ncbiId: string, strand: number, reverse: boolean, trackWidth?: number): ((where: RcsbFvLocationViewInterface) => Promise<RcsbFvTrackData>) {
    return (where: RcsbFvLocationViewInterface) => {
        return new Promise<RcsbFvTrackData>((resolve, reject) => {
            const delta: number = trackWidth ? trackWidth / (where.to - where.from) : 1000 / (where.to - where.from);
            if (delta > 4) {
                const Http = new XMLHttpRequest();
                const url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=' + ncbiId + '&from=' + where.from + '&to=' + where.to + '&strand=' + strand + '&rettype=fasta&retmode=text';
                Http.open("GET", url);
                Http.send();
                Http.onloadend = (e) => {
                    const sequence: string = Http.responseText.split("\n").slice(1).join("");
                    const selectedOption: RcsbFvTrackData = [{begin: where.from, value: reverse ? sequence.split("").reverse().join("") : sequence}];
                    resolve(selectedOption);
                };
                Http.onerror = (e) => {
                    reject("HTTP error while access URL: " + url);
                };
            } else {
                resolve(null);
            }
        });
    }
}

export class RcsbFvChromosome extends RcsbFvCore implements RcsbFvModuleInterface {
    private readonly targetAlignmentList: Map<SequenceReference,Array<Array<TargetAlignment>>> = new Map<SequenceReference, Array<Array<TargetAlignment>>>([
        [SequenceReference.NcbiProtein, new Array<Array<TargetAlignment>>()],
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

    private buildPdbGenomeFv(pdbInstanceId: string, pdbEntityId: string){
        this.alignmentCollectorQueue.sendTask({
            queryId: pdbInstanceId,
            from: SequenceReference.PdbInstance,
            to: SequenceReference.NcbiGenome,
        }, (e)=>{
            const ar: AlignmentResponse = e as AlignmentResponse
            this.collectPdbWorkerResults(ar, pdbInstanceId, pdbEntityId);
        });
    }

    private collectPdbWorkerResults(ar: AlignmentResponse, pdbInstanceId: string, pdbEntityId: string){
        this.pdbEntityTrack = this.collectExons(ar.target_alignment,"target",RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,RcsbAnnotationConstants.provenanceColorCode.rcsbPdb, "", 0)[0];
        this.pdbEntityTrack.rowPrefix = SequenceReference.PdbEntity.replace("_"," ");
        this.pdbEntityTrack.rowTitle = {
            visibleTex: pdbInstanceId,
            style: {
                fontWeight:"bold"
            }
        };
        this.pdbEntityTrack.hideEmptyTrackFlag = false;
        this.buildChromosomeFv(ar.target_alignment[0].target_id, pdbInstanceId, pdbEntityId);
    }

    private buildChromosomeFv(ncbiId: string, pdbInstanceId: string, pdbEntityId: string): void {
        this.nonExonConfigData.push({
            trackId: "mainSequenceTrack_" + ncbiId,
            displayType: RcsbFvDisplayTypes.SEQUENCE,
            trackColor: "#F9F9F9",
            displayColor: "#000000",
            nonEmptyDisplay: true,
            rowPrefix: "DNA",
            rowTitle: {
                visibleTex:"5'",
                style:{
                    fontWeight:"bold"
                },
            },
            titleFlagColor:RcsbAnnotationConstants.provenanceColorCode.external,
            updateDataOnMove: updateData(ncbiId, 1, false, this.rcsbFv?.getBoardConfig()?.trackWidth)
        });
        this.nonExonConfigData.push({
            trackId: "mainSequenceTrack_" + ncbiId,
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
            updateDataOnMove: updateData(ncbiId, 2, true, this.rcsbFv?.getBoardConfig()?.trackWidth)
        });
        this.nonExonConfigData.push(this.pdbEntityTrack);
        //Collect positional features ?
        this.collectFeatures(ncbiId, pdbInstanceId, pdbEntityId);
    }

    private collectFeatures(ncbiId: string, instanceId: string, entityId: string){
        const sources: Array<Source> = [Source.Uniprot, Source.PdbEntity, Source.PdbInstance];
        const filters:Array<FilterInput> = [{
            field:FieldName.TargetId,
            operation:OperationType.Equals,
            source: Source.PdbEntity,
            values:[entityId]
        },{
            field:FieldName.TargetId,
            operation:OperationType.Contains,
            source:Source.PdbInstance,
            values:[instanceId]
        }];
        this.annotationCollector.collect({
            queryId: ncbiId,
            reference: SequenceReference.NcbiGenome,
            sources:sources,
            filters:filters,
            collectSwissModel:true,
            range:[ this.pdbEntityTrack.trackData[0].begin, this.pdbEntityTrack.trackData[0].end ]
        }).then(annRes=>{
            //this.featuresConfigData = annRes;
            this.plot();
            this.collectChromosomeAlignments(ncbiId);
        });
    }

    private collectChromosomeAlignments(chrId: string) {
        for(let i=0;i<30;i++){
            this.nTasks++;
            this.alignmentCollectorQueue.sendTask({
                queryId: chrId,
                from: SequenceReference.NcbiGenome,
                to: SequenceReference.NcbiProtein,
                range: [i*this.batchSize, (i+1)*this.batchSize]
            }, (e)=>{
                const ar: AlignmentResponse = e as AlignmentResponse
                this.collectChromosomeWorkerResults(i,SequenceReference.NcbiProtein,ar,false);
            });
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

    private collectExons(targetAlignmentList: Array<TargetAlignment>, member: "query"|"target", blockColor: string, flagTitleColor: string, title: string, index: number): Array<RcsbFvRowConfigInterface> {
        const beginMember: "query_begin"|"target_begin" = member === "query" ? "query_begin" : "target_begin";
        const endMember: "query_end"|"target_end" = member === "query" ? "query_end" : "target_end";
        const entities: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
        targetAlignmentList.forEach((targetAlignment,i) => {
            if(targetAlignment.aligned_regions.length == 0 )
                return;
            const alignedBlocks: Array<RcsbFvTrackDataElementInterface> = [];
            if(targetAlignment.orientation>0) {
                alignedBlocks.push({
                    begin: targetAlignment.aligned_regions[0][beginMember],
                    end: targetAlignment.aligned_regions[targetAlignment.aligned_regions.length-1][endMember],
                    gaps: [],
                    description:[targetAlignment.target_id]
                });
                if(targetAlignment.aligned_regions[targetAlignment.aligned_regions.length-1][endMember] > this.maxRange)
                    this.maxRange = targetAlignment.aligned_regions[targetAlignment.aligned_regions.length-1][endMember];
                targetAlignment.aligned_regions.forEach((region,n) => {
                    if((n+1)<targetAlignment.aligned_regions.length)
                        alignedBlocks[0].gaps.push({
                            begin: region[endMember],
                            end: targetAlignment.aligned_regions[n+1][beginMember],
                            isConnected: true
                        });
                });
            }else{
                alignedBlocks.push({
                    end: targetAlignment.aligned_regions[0][beginMember],
                    begin: targetAlignment.aligned_regions[targetAlignment.aligned_regions.length-1][endMember],
                    gaps: [],
                    description:[targetAlignment.target_id]
                });
                if(targetAlignment.aligned_regions[0][beginMember]>this.maxRange)
                    this.maxRange = targetAlignment.aligned_regions[0][beginMember];
                targetAlignment.aligned_regions.reverse().forEach((region,n) => {
                    if((n+1)<targetAlignment.aligned_regions.length)
                        alignedBlocks[0].gaps.push({
                            end: targetAlignment.aligned_regions[n+1][endMember],
                            begin: region[beginMember],
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
        return this.simplifyExonTracks(entities.sort((a,b)=>{
            if(a.trackData[0].begin != b.trackData[0].begin) return a.trackData[0].begin-b.trackData[0].begin;
            if(b.trackData[0].end != a.trackData[0].end) return b.trackData[0].end-a.trackData[0].end;
            return a.trackData[0].gaps.map(g=>g.end-g.begin).reduce((a,b)=>a+b,0)-b.trackData[0].gaps.map(g=>g.end-g.begin).reduce((a,b)=>a+b,0);
        }), title, index);
    }

    private simplifyExonTracks(tracks: Array<RcsbFvRowConfigInterface>, title: string, index: number): Array<RcsbFvRowConfigInterface> {
        const lightTracks: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
        tracks.forEach(t=>{
            const trackBegin: number = t.trackData[0].begin;
            const trackEnd: number = t.trackData[0].end;
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
                const begin: number = lightTracks[N].trackData[0].begin;
                const end: number = lightTracks[N].trackData[0].end;
                const trackHash: string = trackBegin+"."+t.trackData[0].gaps.map((b)=>{return b.begin+"."+b.end}).join(".")+"."+trackEnd;
                const ltHash: string = begin+"."+lightTracks[N].trackData[0].gaps.map((b)=>{return b.begin+"."+b.end}).join(".")+"."+end;
                if( trackHash != ltHash ){
                    if( (this.entityBegin > 0 && this.entityEnd > 0) && !(trackBegin > this.entityEnd || trackEnd < this.entityBegin) ){
                        if(trackBegin<this.beginView)
                            this.beginView = trackBegin;
                        if(trackEnd>this.endView)
                            this.endView = trackEnd;
                    }
                    lightTracks.push(t);
                }else{
                    lightTracks[N].trackData[0].description.push(t.trackData[0].description[0]);
                }
            }
        });
        if(index == 0) lightTracks[0].rowTitle = title;
        return lightTracks;
    }

    private mergeExonTracks(tracks: Array<RcsbFvRowConfigInterface>): Array<RcsbFvRowConfigInterface> {
        const lightTracks: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
        tracks.forEach(t=>{
            if(lightTracks.length == 0){
                lightTracks.push(t);
            }else{
                const trackBegin: number = t.trackData[0].begin;
                let index: number = -1;
                lightTracks.forEach((lT,n)=>{
                    const N: number = lT.trackData.length-1;
                    const begin: number = lT.trackData[N].begin;
                    const end: number = lT.trackData[N].end;
                    if(trackBegin > end && index == -1){
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

    private setDomainView(): void{
        if(this.entityBegin == 0 && this.entityEnd == 0){
            this.entityBegin = this.pdbEntityTrack.trackData[0].begin;
            this.entityEnd = this.pdbEntityTrack.trackData[0].end;
            this.beginView = this.pdbEntityTrack.trackData[0].begin;
            this.endView = this.pdbEntityTrack.trackData[0].end;
        }
        const begin: number = this.beginView;
        const end: number = this.endView;
        const length = end - begin;
        this.rcsbFv.setDomain([begin-Math.ceil(0.05*length),Math.ceil(end+0.05*length)]);
    }

    private plot(): void{
        console.log("PROCESSING");
        let tracks: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
        if(this.featuresConfigData != null && this.featuresConfigData.length > 0)
            tracks = this.featuresConfigData;
        this.targetAlignmentList.get(SequenceReference.NcbiProtein).forEach((tA, index)=>{
            if(tA.length>0)
                tracks = tracks.concat( this.collectExons(tA,"query", RcsbAnnotationConstants.provenanceColorCode.external,RcsbAnnotationConstants.provenanceColorCode.external, "NCBI PROTEINS", index) );
        });
        this.targetAlignmentList.get(SequenceReference.PdbEntity).forEach((tA, index)=>{
            if(tA.length>0)
                tracks = tracks.concat( this.collectExons(tA,"query", RcsbAnnotationConstants.provenanceColorCode.rcsbPdb, RcsbAnnotationConstants.provenanceColorCode.rcsbPdb, "PDB ENTITIES", index) );
        });
        if(tracks.length > 0)
            this.rowConfigData = this.nonExonConfigData.concat(this.mergeExonTracks(tracks));
        else
            this.rowConfigData = this.nonExonConfigData;
        console.log("RENDERING");
        this.boardConfigData.borderColor = "#F9F9F9";
        this.boardConfigData.length = Math.floor(this.maxRange + 0.01*this.maxRange);
        this.boardConfigData.includeAxis = true;
        this.display();
        this.setDomainView();
    }

    public build(buildConfig: RcsbFvModuleBuildInterface): void {
        this.buildPdbGenomeFv(buildConfig.instanceId, buildConfig.entityId);
    }
}
