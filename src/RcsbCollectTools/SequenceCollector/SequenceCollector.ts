import {RcsbFvDisplayTypes, RcsbFvLink, RcsbFvRowConfigInterface,} from '@rcsb/rcsb-saguaro';

import {
    AlignedRegion,
    AlignmentResponse,
    SequenceReference,
    TargetAlignment
} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {TagDelimiter} from "../../RcsbUtils/TagDelimiter";
import {PolymerEntityInstanceTranslate, TranslateContextInterface} from "../../RcsbUtils/PolymerEntityInstanceTranslate";

import {BuildAlignementsInterface, SequenceCollectorHelper} from "./SequenceCollectorHelper";
import {RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {
    AlignmentCollectConfig,
    SequenceCollectorInterface
} from "./SequenceCollectorInterface";
import {Subject} from "rxjs";
import {ObservableHelper} from "../../RcsbUtils/ObservableHelper";

export interface AlignedObservedRegion extends AlignedRegion {
    unModelled?:boolean;
    openBegin?:boolean;
    openEnd?:boolean;
}

export interface SequenceCollectorDataInterface {
    sequence: Array<RcsbFvRowConfigInterface>;
    alignment: Array<RcsbFvRowConfigInterface>;
}

export class SequenceCollector implements SequenceCollectorInterface{

    private sequenceLength: number;
    private targets: Array<string> = new Array<string>();
    private requestStatus: "pending"|"complete" = "pending";
    private dynamicDisplay: boolean = false;

    private readonly helper: SequenceCollectorHelper = new SequenceCollectorHelper();
    readonly rcsbFvQuery: RcsbClient = new RcsbClient();
    private polymerEntityInstanceTranslator:PolymerEntityInstanceTranslate;
    private readonly targetsSubject: Subject<Array<string>> = new Subject<Array<string>>();

    private tagObservedRegions: (region: AlignedRegion, commonContext: TranslateContextInterface) => Array<AlignedObservedRegion> = (region: AlignedRegion, commonContext: TranslateContextInterface) => {
        return [{...region,unModelled:false}];
    }

    public async collect(
        requestConfig: AlignmentCollectConfig,
        entityInstanceMapCollector?: (instanceIds: Array<string>)=>Promise<void>,
        tagObservedRegions?: (region: AlignedRegion, commonContext: TranslateContextInterface) => Array<AlignedObservedRegion>
    ): Promise<SequenceCollectorDataInterface> {

        if(typeof tagObservedRegions === "function")
            this.tagObservedRegions = tagObservedRegions;

        const alignmentResponse: AlignmentResponse = await this.requestAlignment(requestConfig);
        if(alignmentResponse.query_sequence == null || alignmentResponse.query_sequence.length == 0) {
            console.warn(alignmentResponse);
            throw "Sequence not found in alignments from " + requestConfig.from + " to " + requestConfig.to + " queryId " + requestConfig.queryId;
        }
        this.sequenceLength = alignmentResponse.query_sequence.length;
        const data: AlignmentResponse = alignmentResponse;
        const querySequence: string = data.query_sequence;
        const alignmentData: Array<TargetAlignment> = data.target_alignment;
        if(typeof entityInstanceMapCollector === "function" && alignmentData){
            await entityInstanceMapCollector(alignmentData.map(a=>{return a.target_id}));
        }
        const buildAlignmentConfig: BuildAlignementsInterface= {
            targetAlignmentList: alignmentData,
            queryId:requestConfig.queryId,
            querySequence: querySequence,
            filterByTargetContains:requestConfig.filterByTargetContains,
            to:requestConfig.to,
            from:requestConfig.from,
            excludeAlignmentLinks: requestConfig.excludeAlignmentLinks,
            fitTitleWidth: requestConfig.fitTitleWidth
        };
        const alignmentTracks = this.buildAlignments(buildAlignmentConfig);
        this.complete();
        return { sequence: [this.buildSequenceTrack(requestConfig, querySequence)], alignment:alignmentTracks};
    }

    public async getTargets():Promise<Array<string>> {
        return new Promise<Array<string>>((resolve,reject)=>{
            if(this.requestStatus === "complete"){
                resolve(this.targets);
            }else{
                ObservableHelper.oneTimeSubscription<Array<string>>(resolve, this.targetsSubject);
            }
        });
    }

    public getSequenceLength(): number{
        return this.sequenceLength;
    }

    public getPolymerEntityInstanceTranslator(): PolymerEntityInstanceTranslate {
        return this.polymerEntityInstanceTranslator;
    }

    public setPolymerEntityInstanceTranslator(p: PolymerEntityInstanceTranslate): void {
        this.helper.setPolymerEntityInstanceTranslator(p);
        this.polymerEntityInstanceTranslator = p;
    }

    private complete(){
        this.requestStatus = "complete";
        this.targetsSubject.next(this.targets);
    }

    private buildAlignments(alignmentData: BuildAlignementsInterface): Array<RcsbFvRowConfigInterface> {
        const {alignments, targets}:{alignments: Array<RcsbFvRowConfigInterface>, targets: Array<string>} = this.helper.buildAlignments(alignmentData, this.dynamicDisplay, this.tagObservedRegions);
        this.targets = targets;
        console.log("Alignment Processing Complete");
        return alignments;
    }

    private buildSequenceTrack(requestConfig: AlignmentCollectConfig, querySequence: string): RcsbFvRowConfigInterface{
        let rowPrefix:string|RcsbFvLink = requestConfig.from.replace("_"," ")+" "+TagDelimiter.sequenceTitle;
        let rowTitle:string|RcsbFvLink = this.helper.buildSequenceRowTitle(requestConfig);
        const sequenceTrack: RcsbFvRowConfigInterface = {
            trackId: "mainSequenceTrack_" + requestConfig.queryId,
            displayType: RcsbFvDisplayTypes.SEQUENCE,
            trackColor: "#F9F9F9",
            displayColor: "#000000",
            rowTitle: rowTitle,
            rowPrefix: rowPrefix,
            nonEmptyDisplay: true,
            trackData: this.helper.buildSequenceData({
                sequenceData:[],
                sequence:querySequence,
                begin:1,
                oriBegin:null,
                queryId:requestConfig.queryId,
                targetId:null,
                from:requestConfig.from,
                to:null},true)
        };
        if(requestConfig.from === SequenceReference.PdbEntity || requestConfig.from === SequenceReference.PdbInstance ){
            sequenceTrack.titleFlagColor = RcsbAnnotationConstants.provenanceColorCode.rcsbPdb;
        }else{
            sequenceTrack.titleFlagColor = RcsbAnnotationConstants.provenanceColorCode.external;
        }
        return sequenceTrack;
    }

    private collectGenomeRegions(): void {
        /*const genomeMapReponse: AlignmentResponse = await this.rcsbFvQuery.requestAlignment({
            queryId: requestConfig.queryId,
            from: requestConfig.from,
            to: SequenceReference.NcbiGenome
        });
        const genomeData: Array<TargetAlignment> = genomeMapReponse.target_alignment;
        console.log(this.buildAlignments({
            targetAlignmentList: genomeData,
            queryId:requestConfig.queryId,
            querySequence: null,
            filterByTargetContains:requestConfig.filterByTargetContains,
            to:requestConfig.to,
            from:requestConfig.from,
            excludeAlignmentLinks: requestConfig.excludeAlignmentLinks,
            fitTitleWidth: requestConfig.fitTitleWidth
        }));*/
    }

    private async requestAlignment(requestConfig: AlignmentCollectConfig): Promise<AlignmentResponse>{
        this.requestStatus = "pending";
        if(requestConfig.dynamicDisplay)
            this.dynamicDisplay = true;

        return await this.rcsbFvQuery.requestAlignment({
                queryId: requestConfig.queryId,
                from: requestConfig.from,
                to: requestConfig.to
            });
    }
}