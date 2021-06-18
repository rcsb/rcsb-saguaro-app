import {RcsbFvDisplayTypes, RcsbFvLink, RcsbFvRowConfigInterface,} from '@rcsb/rcsb-saguaro';

import {
    AlignedRegion,
    AlignmentResponse,
    QueryAlignmentArgs,
    SequenceReference,
    TargetAlignment
} from "../../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbAnnotationConstants} from "../../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {TagDelimiter} from "../../Utils/TagDelimiter";
import {PolymerEntityInstanceTranslate, TranslateContextInterface} from "../../Utils/PolymerEntityInstanceTranslate";

import {BuildAlignementsInterface, SequenceCollectorHelper} from "./SequenceCollectorHelper";
import {RcsbClient} from "../../../RcsbGraphQL/RcsbClient";
import {SequenceCollectorInterface} from "./SequenceCollectorInterface";

export interface CollectAlignmentInterface extends QueryAlignmentArgs {
    filterByTargetContains?:string;
    dynamicDisplay?: boolean;
    excludeAlignmentLinks?: boolean;
    fitTitleWidth?:boolean;
    excludeFirstRowLink?:boolean;
}

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
    protected finished: boolean = false;
    private dynamicDisplay: boolean = false;

    private readonly helper: SequenceCollectorHelper = new SequenceCollectorHelper();
    readonly rcsbFvQuery: RcsbClient = new RcsbClient();
    private polymerEntityInstanceTranslator:PolymerEntityInstanceTranslate;

    private tagObservedRegions: (region: AlignedRegion, commonContext: TranslateContextInterface) => Array<AlignedObservedRegion> = (region: AlignedRegion, commonContext: TranslateContextInterface) => {
        return [{...region,unModelled:false}];
    }

    public async collect(
        requestConfig: CollectAlignmentInterface,
        entityInstanceMapCollector?: (instanceIds: Array<string>)=>Promise<void>,
        tagObservedRegions?: (region: AlignedRegion, commonContext: TranslateContextInterface) => Array<AlignedObservedRegion>
    ): Promise<SequenceCollectorDataInterface> {

        if(typeof tagObservedRegions === "function")
            this.tagObservedRegions = tagObservedRegions;
        if(requestConfig.dynamicDisplay)
            this.dynamicDisplay = true;

        const alignmentResponse: AlignmentResponse = await this.rcsbFvQuery.requestAlignment({
            queryId: requestConfig.queryId,
            from: requestConfig.from,
            to: requestConfig.to
        });
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
        if(alignmentResponse.query_sequence == null || alignmentResponse.query_sequence.length == 0) {
            console.warn(alignmentResponse);
            throw "Sequence not found in alignments from " + requestConfig.from + " to " + requestConfig.to + " queryId " + requestConfig.queryId;
        }
        this.sequenceLength = alignmentResponse.query_sequence.length;
        const data: AlignmentResponse = alignmentResponse;
        const querySequence: string = data.query_sequence;
        const alignmentData: Array<TargetAlignment> = data.target_alignment;
        if(typeof entityInstanceMapCollector === "function"){
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
        this.finished = true;
        return { sequence: [this.buildSequenceTrack(requestConfig, querySequence)], alignment:alignmentTracks};
    }

    public async getTargets():Promise<Array<string>> {
        return new Promise<Array<string>>((resolve,reject)=>{
            const recursive:()=>void = ()=>{
                if(this.finished){
                    resolve(this.targets);
                }else{
                    window.setTimeout(() => {
                        recursive();
                    }, 1000);
                }
            };
            recursive();
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

    private buildAlignments(alignmentData: BuildAlignementsInterface): Array<RcsbFvRowConfigInterface> {
        const {alignments, targets}:{alignments: Array<RcsbFvRowConfigInterface>, targets: Array<string>} = this.helper.buildAlignments(alignmentData, this.dynamicDisplay, this.tagObservedRegions);
        this.targets = targets;
        console.log("Alignment Processing Complete");
        return alignments;
    }

    private buildSequenceTrack(requestConfig: CollectAlignmentInterface, querySequence: string): RcsbFvRowConfigInterface{
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

}