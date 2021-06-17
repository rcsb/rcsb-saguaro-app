import {
    RcsbFvDisplayTypes,
    RcsbFvLink,
    RcsbFvRowConfigInterface,
} from '@rcsb/rcsb-saguaro';

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

import {
    BuildAlignementsInterface,
    SequenceCollectorHelper
} from "./SequenceCollectorHelper";
import {RcsbFvQuery} from "../../../RcsbGraphQL/RcsbFvQuery";
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

    private sequenceConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private sequenceLength: number;
    private targets: Array<string> = new Array<string>();
    protected finished: boolean = false;
    private dynamicDisplay: boolean = false;

    private helper: SequenceCollectorHelper = new SequenceCollectorHelper(null);
    private rcsbFvQuery: RcsbFvQuery = new RcsbFvQuery();
    private polymerEntityInstanceTranslator:PolymerEntityInstanceTranslate;

    private tagObservedRegions: (region: AlignedRegion, commonContext: TranslateContextInterface) => Array<AlignedObservedRegion> = (region: AlignedRegion, commonContext: TranslateContextInterface) => {
        return [{...region,unModelled:false}];
    }

    public collect(
        requestConfig: CollectAlignmentInterface,
        entityInstanceMapCollector?: (instanceIds: Array<string>)=>Promise<null>,
        tagObservedRegions?: (region: AlignedRegion, commonContext: TranslateContextInterface) => Array<AlignedObservedRegion>
    ): Promise<SequenceCollectorDataInterface> {

        if(typeof tagObservedRegions === "function")
            this.tagObservedRegions = tagObservedRegions;
        if(requestConfig.dynamicDisplay)
            this.dynamicDisplay = true;

        return this.query().requestAlignment({
           queryId: requestConfig.queryId,
           from: requestConfig.from,
           to: requestConfig.to
        }).then(result => {
            if(result.query_sequence == null || result.query_sequence.length == 0) {
                console.warn(result);
                throw "Sequence not found in alignments from " + requestConfig.from + " to " + requestConfig.to + " queryId " + requestConfig.queryId;
            }
            this.sequenceLength = result.query_sequence.length;
            const data: AlignmentResponse = result;
            const querySequence: string = data.query_sequence;
            const alignmentData: Array<TargetAlignment> = data.target_alignment;
            let rowPrefix:string|RcsbFvLink = requestConfig.from.replace("_"," ")+" "+TagDelimiter.sequenceTitle;
            let rowTitle:string|RcsbFvLink = this.helper.buildSequenceRowTitle(requestConfig);
            const track: RcsbFvRowConfigInterface = {
                trackId: "mainSequenceTrack_" + requestConfig.queryId,
                displayType: RcsbFvDisplayTypes.SEQUENCE,
                trackColor: "#F9F9F9",
                displayColor: "#000000",
                rowTitle: rowTitle,
                rowPrefix: rowPrefix,
                nonEmptyDisplay: true,
                trackData: this.helper.buildSequenceData({
                    sequenceData:[],
                    sequence:result.query_sequence,
                    begin:1,
                    oriBegin:null,
                    queryId:requestConfig.queryId,
                    targetId:null,
                    from:requestConfig.from,
                    to:null},true)
            };
            if(requestConfig.from === SequenceReference.PdbEntity || requestConfig.from === SequenceReference.PdbInstance ){
                track.titleFlagColor = RcsbAnnotationConstants.provenanceColorCode.rcsbPdb;
            }else{
                track.titleFlagColor = RcsbAnnotationConstants.provenanceColorCode.external;
            }
            this.sequenceConfigData.push(track);
            if(entityInstanceMapCollector == null){
                return this.buildAlignments({
                    targetAlignmentList: alignmentData,
                    queryId:requestConfig.queryId,
                    querySequence: querySequence,
                    filterByTargetContains:requestConfig.filterByTargetContains,
                    to:requestConfig.to,
                    from:requestConfig.from,
                    excludeAlignmentLinks: requestConfig.excludeAlignmentLinks,
                    fitTitleWidth: requestConfig.fitTitleWidth
                });
            }else{
                return entityInstanceMapCollector(alignmentData.map(a=>{return a.target_id})).then(()=>{
                    return this.buildAlignments({
                        targetAlignmentList: alignmentData,
                        queryId:requestConfig.queryId,
                        querySequence: querySequence,
                        filterByTargetContains:requestConfig.filterByTargetContains,
                        to:requestConfig.to,
                        from:requestConfig.from,
                        excludeAlignmentLinks: requestConfig.excludeAlignmentLinks,
                        fitTitleWidth: requestConfig.fitTitleWidth
                    })
                });
            }
         }).catch(error=>{
             console.log(error);
             throw error;
         });
    }

    public getTargets():Promise<Array<string>> {
        return new Promise<Array<string>>((resolve,reject)=>{
            const recursive:()=>void = ()=>{
                if(this.finished){
                    resolve(this.targets);
                }else{
                    if(typeof window!== "undefined") {
                        window.setTimeout(() => {
                            recursive();
                        }, 1000);
                    }
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

    public query(): RcsbFvQuery {
        return this.rcsbFvQuery;
    }

    public setPolymerEntityInstanceTranslator(p: PolymerEntityInstanceTranslate): void {
        this.helper = new SequenceCollectorHelper(p);
        this.polymerEntityInstanceTranslator = p;
    }

    private buildAlignments(alignmentData: BuildAlignementsInterface): SequenceCollectorDataInterface {
        const {alignments, targets}:{alignments: Array<RcsbFvRowConfigInterface>, targets: Array<string>} = this.helper.buildAlignments(alignmentData, this.dynamicDisplay, this.tagObservedRegions);
        this.finished = true;
        this.targets = targets;
        console.log("Alignment Processing Complete");
        return { sequence: this.sequenceConfigData, alignment:alignments};
    }

}