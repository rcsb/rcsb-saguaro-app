import {
    RcsbFvDisplayConfigInterface,
    RcsbFvDisplayTypes,
    RcsbFvLink,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from '@bioinsilico/rcsb-saguaro';

import {
    AlignedRegion,
    AlignmentResponse,
    QueryAlignmentArgs,
    SequenceReference,
    Source,
    TargetAlignment
} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvQuery} from "../../RcsbGraphQL/RcsbFvQuery";
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {TagDelimiter} from "../Utils/TagDelimiter";
import {CoreCollector} from "./CoreCollector";
import {TranslateContextInterface} from "../Utils/PolymerEntityInstanceTranslate";

import * as resource from "../../../web.resources.json";
import {FeatureTools} from "../FeatureTools/FeatureTools";

interface CollectAlignmentInterface extends QueryAlignmentArgs {
    filterByTargetContains?:string;
    dynamicDisplay?: boolean;
    excludeAlignmentLinks?: boolean;
    fitTitleWidth?:boolean;
}

export interface SequenceCollectorDataInterface {
    sequence: Array<RcsbFvRowConfigInterface>;
    alignment: Array<RcsbFvRowConfigInterface>;
}

interface BuildAlignementsInterface {
    targetAlignmentList: Array<TargetAlignment>;
    queryId: string;
    querySequence: string;
    filterByTargetContains?:string;
    to:SequenceReference;
    from:SequenceReference;
    excludeAlignmentLinks?: boolean;
    fitTitleWidth?:boolean;
}

interface BuildSequenceDataInterface extends TranslateContextInterface{
    sequenceData: Array<RcsbFvTrackDataElementInterface>;
    sequence: string;
    begin: number;
    oriBegin: number;
}

export class SequenceCollector extends CoreCollector{

    private rcsbFvQuery: RcsbFvQuery = new RcsbFvQuery();
    private seqeunceConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private alignmentsConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    private sequenceLength: number;
    private targets: Array<string> = new Array<string>();
    private finished: boolean = false;
    private dynamicDisplay: boolean = false;

    public collect(requestConfig: CollectAlignmentInterface): Promise<SequenceCollectorDataInterface> {
        if(requestConfig.dynamicDisplay)
            this.dynamicDisplay = true;
        return this.rcsbFvQuery.requestAlignment({
           queryId: requestConfig.queryId,
           from: requestConfig.from,
           to: requestConfig.to
        }).then(result => {
            if(result.query_sequence == null || result.query_sequence.length == 0) {
                console.warn(result);
                throw "Alignment not found from " + requestConfig.from + " to " + requestConfig.to + " queryId " + requestConfig.queryId;
            }
            this.sequenceLength = result.query_sequence.length;
            const data: AlignmentResponse = result;
            const querySequence: string = data.query_sequence;
            const alignmentData: Array<TargetAlignment> = data.target_alignment;
            let rowPrefix:string|RcsbFvLink = requestConfig.from.replace("_"," ")+" "+TagDelimiter.sequenceTitle;
            let rowTitle:string|RcsbFvLink;
            if(requestConfig.from === SequenceReference.Uniprot){
                rowTitle = {
                    visibleTex: requestConfig.queryId,
                    url: (resource as any).rcsb_uniprot.url+requestConfig.queryId,
                    style: {
                        fontWeight:"bold",
                        color:RcsbAnnotationConstants.provenanceColorCode.rcsbPdb
                    }
                };
            } else if( requestConfig.from === SequenceReference.PdbInstance && this.getPolymerEntityInstance()!=null) {
                rowTitle = {
                    visibleTex: requestConfig.queryId.split(TagDelimiter.instance)[0] + TagDelimiter.instance + this.getPolymerEntityInstance().translateAsymToAuth(requestConfig.queryId.split(TagDelimiter.instance)[1]),
                    style: {
                        fontWeight:"bold",
                    }
                };
            } else {
                rowTitle = {
                    visibleTex: requestConfig.queryId,
                    style: {
                        fontWeight:"bold",
                    }
                };
            }
            const track: RcsbFvRowConfigInterface = {
                trackId: "mainSequenceTrack_" + requestConfig.queryId,
                displayType: RcsbFvDisplayTypes.SEQUENCE,
                trackColor: "#F9F9F9",
                displayColor: "#000000",
                rowTitle: rowTitle,
                rowPrefix: rowPrefix,
                nonEmptyDisplay: true,
                trackData: this.buildSequenceData({
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
            this.seqeunceConfigData.push(track);
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
         }).catch(error=>{
             console.log(error);
             throw error;
         });
    }

    public getLength(): number{
        return this.sequenceLength;
    }

    private buildAlignments(alignmentData: BuildAlignementsInterface): SequenceCollectorDataInterface {

        const findMismatch = (seqA: string, seqB: string) => {
            const out = [];
            if (seqA.length === seqB.length) {
                for (let i = 0; i < seqA.length; i++) {
                    if (seqA.charAt(i) !== seqB.charAt(i)) {
                        out.push(i);
                    }
                }
            }
            return out;
        };


        if(alignmentData.targetAlignmentList instanceof Array) {
            alignmentData.targetAlignmentList.sort((a: TargetAlignment, b: TargetAlignment) => {
                return a.target_id.localeCompare(b.target_id);
            }).forEach(targetAlignment => {
                if (alignmentData.filterByTargetContains != null && !targetAlignment.target_id.includes(alignmentData.filterByTargetContains))
                    return;
                if (targetAlignment.target_sequence == null)
                    return;
                const commonContext: TranslateContextInterface = {
                    queryId: alignmentData.queryId,
                    targetId: targetAlignment.target_id,
                    from: alignmentData.from,
                    to: alignmentData.to
                };

                this.targets.push(targetAlignment.target_id);
                const targetSequence = targetAlignment.target_sequence;
                const sequenceData: Array<RcsbFvTrackDataElementInterface> = [];
                const alignedBlocks: Array<RcsbFvTrackDataElementInterface> = [];
                const mismatchData: Array<RcsbFvTrackDataElementInterface> = [];
                targetAlignment.aligned_regions.forEach(region => {
                    const regionSequence = targetSequence.substring(region.target_begin - 1, region.target_end);
                    this.buildSequenceData({
                        ...commonContext,
                        sequenceData: sequenceData,
                        sequence: regionSequence,
                        begin: region.query_begin,
                        oriBegin: region.target_begin
                    });
                    let openBegin = false;
                    if (region.target_begin != 1)
                        openBegin = true;
                    let openEnd = false;
                    if (region.target_end != targetSequence.length)
                        openEnd = true;
                    alignedBlocks.push(this.addAuthorResIds({
                        begin: region.query_begin,
                        end: region.query_end,
                        oriBegin: region.target_begin,
                        oriEnd: region.target_end,
                        sourceId: targetAlignment.target_id,
                        source: alignmentData.to,
                        provenanceName: RcsbAnnotationConstants.provenanceName.pdb,
                        provenanceColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                        openBegin: openBegin,
                        openEnd: openEnd,
                        type: "ALIGNED_BLOCK",
                        title: "ALIGNED REGION"
                    }, commonContext));
                    findMismatch(regionSequence, alignmentData.querySequence.substring(region.query_begin - 1, region.query_end),).forEach(m => {
                        mismatchData.push(this.addAuthorResIds({
                            begin: (m + region.query_begin),
                            oriBegin: (m + region.target_begin),
                            sourceId: targetAlignment.target_id,
                            source: alignmentData.to,
                            provenanceName: RcsbAnnotationConstants.provenanceName.pdb,
                            provenanceColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                            type: "MISMATCH",
                            title: "MISMATCH"
                        }, commonContext));
                    });
                });
                FeatureTools.mergeBlocks(alignedBlocks);
                const sequenceDisplay: RcsbFvDisplayConfigInterface = {
                    displayType: RcsbFvDisplayTypes.SEQUENCE,
                    displayColor: "#000000",
                    displayData: sequenceData,
                    dynamicDisplay: this.dynamicDisplay
                };
                const mismatchDisplay: RcsbFvDisplayConfigInterface = {
                    displayType: RcsbFvDisplayTypes.PIN,
                    displayColor: "#FF9999",
                    displayData: mismatchData
                };
                const alignmentDisplay: RcsbFvDisplayConfigInterface = {
                    displayType: RcsbFvDisplayTypes.BLOCK,
                    displayColor: "#9999FF",
                    displayData: alignedBlocks
                };
                let rowPrefix: string = alignmentData.to.replace("_", " ") + " " + TagDelimiter.alignmentTitle;
                let rowTitle: string | RcsbFvLink;
                if (alignmentData.to === SequenceReference.PdbInstance && this.getPolymerEntityInstance() != null) {
                    rowTitle = {
                        visibleTex:targetAlignment.target_id.split(TagDelimiter.instance)[0] + TagDelimiter.instance + this.getPolymerEntityInstance().translateAsymToAuth(targetAlignment.target_id.split(TagDelimiter.instance)[1]),
                        url:(resource as any).rcsb_entry.url+targetAlignment.target_id.split(TagDelimiter.instance)[0],
                        style: {
                            fontWeight:"bold",
                            color:RcsbAnnotationConstants.provenanceColorCode.rcsbPdb
                        }
                    };
                } else if (alignmentData.to === SequenceReference.PdbEntity && !alignmentData.excludeAlignmentLinks ) {
                    rowTitle = {
                        visibleTex:targetAlignment.target_id,
                        url:(resource as any).rcsb_entry.url+targetAlignment.target_id.split(TagDelimiter.entity)[0],
                        style: {
                            fontWeight:"bold",
                            color:RcsbAnnotationConstants.provenanceColorCode.rcsbPdb
                        }
                    };
                } else if( alignmentData.to === SequenceReference.Uniprot ){
                    rowTitle = {
                        visibleTex: targetAlignment.target_id,
                        url: (resource as any).rcsb_uniprot.url+targetAlignment.target_id,
                        style: {
                            fontWeight:"bold",
                            color:RcsbAnnotationConstants.provenanceColorCode.rcsbPdb
                        }
                    };
                } else {
                    rowTitle = targetAlignment.target_id;
                }
                const track: RcsbFvRowConfigInterface = {
                    trackId: "targetSequenceTrack_"+targetAlignment.target_id,
                    displayType: RcsbFvDisplayTypes.COMPOSITE,
                    trackColor: "#F9F9F9",
                    rowPrefix: rowPrefix,
                    rowTitle: rowTitle,
                    fitTitleWidth: alignmentData.fitTitleWidth,
                    titleFlagColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                    displayConfig: [alignmentDisplay, mismatchDisplay, sequenceDisplay]
                };
                this.alignmentsConfigData.push(track);
            });
        }
        this.finished = true;
        return { sequence: this.seqeunceConfigData, alignment:this.alignmentsConfigData};
    }

    private buildSequenceData(config: BuildSequenceDataInterface, isQuerySequence?: boolean):Array<RcsbFvTrackDataElementInterface> {
        let provenanceName: string = config.to;
        if(isQuerySequence === true)
            provenanceName = config.from;
        let provenanceColor: string = RcsbAnnotationConstants.provenanceColorCode.external;
        if(provenanceName == Source.PdbInstance || provenanceName == Source.PdbEntity) {
            provenanceName = RcsbAnnotationConstants.provenanceName.pdb;
            provenanceColor = RcsbAnnotationConstants.provenanceColorCode.rcsbPdb;
        }
        config.sequence.split("").forEach((s, i) => {
            const o: RcsbFvTrackDataElementInterface = {
                begin: (config.begin + i),
                sourceId: config.targetId,
                source: config.to,
                provenanceName: provenanceName,
                provenanceColor: provenanceColor,
                value: s
            };
            if (typeof config.targetId === "string")
                o.sourceId = config.targetId;
            if (typeof config.oriBegin === "number")
                o.oriBegin = config.oriBegin + i;

            config.sequenceData.push(this.addAuthorResIds(o, {
                from:config.from,
                to:config.to,
                queryId:config.queryId,
                targetId:config.targetId
            }));

        });
        return config.sequenceData;
    }

    private addAuthorResIds(e:RcsbFvTrackDataElementInterface, alignmentContext:TranslateContextInterface):RcsbFvTrackDataElementInterface {
        let o:RcsbFvTrackDataElementInterface = e;
        if(this.getPolymerEntityInstance()!=null){
            this.getPolymerEntityInstance().addAuthorResIds(o,alignmentContext);
        }
        return o;
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
}