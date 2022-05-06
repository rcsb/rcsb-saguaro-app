import {RcsbFvDisplayTypes, RcsbFvLink, RcsbFvRowConfigInterface,} from '@rcsb/rcsb-saguaro';

import {
    AlignedRegion,
    AlignmentResponse,
    SequenceReference,
    TargetAlignment
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {TagDelimiter} from "../../RcsbUtils/Helpers/TagDelimiter";
import {PolymerEntityInstanceTranslate, TranslateContextInterface} from "../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";

import {BuildAlignmentsInterface, SequenceCollectorHelper} from "./SequenceCollectorHelper";
import {rcsbClient, RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {
    AlignmentCollectConfig,
    SequenceCollectorInterface
} from "./SequenceCollectorInterface";
import {Subject} from "rxjs";
import {ObservableHelper} from "../../RcsbUtils/Helpers/ObservableHelper";
import {ExternalTrackBuilderInterface} from "../FeatureTools/ExternalTrackBuilderInterface";

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
    private requestStatus: "pending"|"complete" = "complete";
    private dynamicDisplay: boolean = false;

    private readonly helper: SequenceCollectorHelper = new SequenceCollectorHelper();
    readonly rcsbFvQuery: RcsbClient = rcsbClient;
    private polymerEntityInstanceTranslator:PolymerEntityInstanceTranslate;
    private readonly targetsSubject: Subject<Array<string>> = new Subject<Array<string>>();
    private alignmentResponse: AlignmentResponse;
    private readonly alignmentResponseSubject: Subject<AlignmentResponse> = new Subject<AlignmentResponse>();
    private externalTrackBuilder: ExternalTrackBuilderInterface;

    private tagObservedRegions: (region: AlignedRegion, commonContext: TranslateContextInterface) => Array<AlignedObservedRegion> = (region: AlignedRegion, commonContext: TranslateContextInterface) => {
        return [{...region,unModelled:false}];
    }

    public async collect(
        requestConfig: AlignmentCollectConfig,
        filter?: Array<string>,
        entityInstanceMapCollector?: (instanceIds: Array<string>)=>Promise<void>,
        tagObservedRegions?: (region: AlignedRegion, commonContext: TranslateContextInterface) => Array<AlignedObservedRegion>
    ): Promise<SequenceCollectorDataInterface> {
        this.requestStatus = "pending";

        if(typeof tagObservedRegions === "function")
            this.tagObservedRegions = tagObservedRegions;

        this.alignmentResponse = await this.requestAlignment(requestConfig);
        if(this.alignmentResponse.query_sequence == null || this.alignmentResponse.query_sequence.length == 0) {
            console.warn("Sequence not found in alignments from " + requestConfig.from + " to " + requestConfig.to + " queryId " + requestConfig.queryId);
        }
        this.sequenceLength = this.alignmentResponse.query_sequence?.length ?? this.alignmentResponse.alignment_length;
        const querySequence: string = this.alignmentResponse.query_sequence;
        const targetAlignment: Array<TargetAlignment> = this.alignmentResponse.target_alignment ?? this.alignmentResponse.target_alignment_subset.edges.map(e=>e.node);
        const alignmentData: Array<TargetAlignment> = !filter ? targetAlignment : targetAlignment.filter(ta=>filter.includes(ta.target_id));
        if(typeof entityInstanceMapCollector === "function" && alignmentData){
            await entityInstanceMapCollector(alignmentData.map(a=>{return a.target_id}));
        }
        const buildAlignmentConfig: BuildAlignmentsInterface = {
            targetAlignmentList: alignmentData,
            queryId:requestConfig.queryId ?? requestConfig.groupId,
            querySequence: querySequence,
            filterByTargetContains:requestConfig.filterByTargetContains,
            to:requestConfig.to,
            from:requestConfig.from,
            excludeAlignmentLinks: requestConfig.excludeAlignmentLinks,
            fitTitleWidth: requestConfig.fitTitleWidth
        };
        const alignmentTracks = this.buildAlignments(buildAlignmentConfig);
        this.complete();
        return { sequence: querySequence ? [this.buildSequenceTrack(requestConfig, querySequence)] : null, alignment:alignmentTracks};
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

    public async getAlignmentResponse():Promise<AlignmentResponse> {
        return new Promise<AlignmentResponse>((resolve,reject)=>{
            if(this.requestStatus === "complete"){
                resolve(this.alignmentResponse);
            }else{
                ObservableHelper.oneTimeSubscription<AlignmentResponse>(resolve, this.alignmentResponseSubject);
            }
        });
    }

    public getSequenceLength(): number{
        return this.sequenceLength;
    }

    public setPolymerEntityInstanceTranslator(p: PolymerEntityInstanceTranslate): void {
        this.helper.setPolymerEntityInstanceTranslator(p);
        this.polymerEntityInstanceTranslator = p;
    }

    public setExternalTrackBuilder(externalTrackBuilder: ExternalTrackBuilderInterface): void {
        this.externalTrackBuilder = externalTrackBuilder;
    }

    private complete(){
        this.requestStatus = "complete";
        this.targetsSubject.next(this.targets);
        console.log("Alignment Processing Complete");
    }

    private buildAlignments(alignmentData: BuildAlignmentsInterface): Array<RcsbFvRowConfigInterface> {
        const {alignments, targets}:{alignments: Array<RcsbFvRowConfigInterface>, targets: Array<string>} = this.helper.buildAlignments(alignmentData, this.dynamicDisplay, this.tagObservedRegions);
        this.targets = targets;
        return alignments;
    }

    private buildSequenceTrack(requestConfig: AlignmentCollectConfig, querySequence: string): RcsbFvRowConfigInterface{
        let rowPrefix:string|RcsbFvLink = requestConfig.from ? requestConfig.from.replace("_"," ")+" "+TagDelimiter.sequenceTitle : requestConfig.sequencePrefix;
        let rowTitle:string|RcsbFvLink = this.helper.buildSequenceRowTitle(requestConfig);
        const sequenceTrack: RcsbFvRowConfigInterface = {
            trackId: "mainSequenceTrack_" + requestConfig.queryId ?? requestConfig.groupId,
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
                queryId:requestConfig.queryId ?? requestConfig.groupId,
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

        return requestConfig.queryId ?
            await this.rcsbFvQuery.requestAlignment({
                queryId: requestConfig.queryId,
                from: requestConfig.from,
                to: requestConfig.to
            })
        :
            await this.rcsbFvQuery.requestGroupAlignment({
                group: requestConfig.group,
                groupId: requestConfig.groupId,
                page: requestConfig.page,
                filter: requestConfig.filter
            });
    }
}