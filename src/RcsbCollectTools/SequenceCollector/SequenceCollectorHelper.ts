import {PolymerEntityInstanceTranslate, TranslateContextInterface} from "../../RcsbUtils/PolymerEntityInstanceTranslate";
import {AlignedRegion, SequenceReference, Source, TargetAlignment} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    RcsbFvDisplayConfigInterface, RcsbFvDisplayTypes,
    RcsbFvLink,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import {TagDelimiter} from "../../RcsbUtils/TagDelimiter";
import * as resource from "../../RcsbServerConfig/web.resources.json";
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {FeatureTools} from "../FeatureTools/FeatureTools";
import {AlignedObservedRegion, CollectAlignmentInterface} from "./SequenceCollector";


export interface BuildAlignementsInterface {
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


export class SequenceCollectorHelper {

    private entityInstanceTranslator: PolymerEntityInstanceTranslate;

    public buildAlignments(
        alignmentData: BuildAlignementsInterface,
        dynamicDisplayFlag: boolean,
        tagObservedRegions: (region: AlignedRegion, commonContext: TranslateContextInterface)=>Array<AlignedObservedRegion>
    ): {alignments: Array<RcsbFvRowConfigInterface>, targets: Array<string>} {

        const targets: Array<string> = new Array<string>();
        const alignmentsConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
        if(alignmentData.targetAlignmentList instanceof Array) {
            alignmentData.targetAlignmentList.sort((a: TargetAlignment, b: TargetAlignment) => {
                return a.target_id.localeCompare(b.target_id);
            }).forEach(targetAlignment => {
                if (alignmentData.filterByTargetContains != null && !targetAlignment.target_id.includes(alignmentData.filterByTargetContains))
                    return;
                if (targetAlignment.target_sequence == null)
                    return;

                const targetSequence = targetAlignment.target_sequence;
                const commonContext: TranslateContextInterface = {
                    queryId: alignmentData.queryId,
                    targetId: targetAlignment.target_id,
                    from: alignmentData.from,
                    to: alignmentData.to,
                    targetSequenceLength: targetSequence.length
                };

                targets.push(targetAlignment.target_id);
                const sequenceData: Array<RcsbFvTrackDataElementInterface> = [];
                let alignedBlocks: Array<RcsbFvTrackDataElementInterface> = [];
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

                    tagObservedRegions(region, commonContext).forEach(r=>{
                        alignedBlocks.push(this.addAuthorResIds({
                            begin: r.query_begin,
                            end: r.query_end,
                            oriBegin: r.target_begin,
                            oriEnd: r.target_end,
                            sourceId: targetAlignment.target_id,
                            source: alignmentData.to,
                            provenanceName: RcsbAnnotationConstants.provenanceName.pdb,
                            provenanceColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                            openBegin: r.openBegin ?? openBegin,
                            openEnd: r.openEnd ?? openEnd,
                            type: "ALIGNED_BLOCK",
                            title: r.unModelled ? "UNMODELED REGION" : "ALIGNED REGION",
                            color: r.unModelled ? "#AAAAAA": undefined
                        }, commonContext));
                    })

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
                    dynamicDisplay: dynamicDisplayFlag
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
                const track: RcsbFvRowConfigInterface = {
                    trackId: "targetSequenceTrack_"+targetAlignment.target_id,
                    displayType: RcsbFvDisplayTypes.COMPOSITE,
                    trackColor: "#F9F9F9",
                    rowPrefix: rowPrefix,
                    rowTitle: this.buildAlignmentRowTitle(targetAlignment, alignmentData),
                    fitTitleWidth: alignmentData.fitTitleWidth,
                    titleFlagColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                    displayConfig: [alignmentDisplay, mismatchDisplay, sequenceDisplay]
                };
                alignmentsConfigData.push(track);
            });
        }
        return { targets:targets, alignments:alignmentsConfigData};
    }

    public buildSequenceData(config: BuildSequenceDataInterface, isQuerySequence?: boolean):Array<RcsbFvTrackDataElementInterface> {
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

    public buildSequenceRowTitle(requestConfig: CollectAlignmentInterface): string|RcsbFvLink{
        let rowTitle:string|RcsbFvLink;
        if(!requestConfig.excludeFirstRowLink && requestConfig.from === SequenceReference.Uniprot){
            rowTitle = {
                visibleTex: requestConfig.queryId,
                url: (resource as any).rcsb_uniprot.url+requestConfig.queryId,
                style: {
                    fontWeight:"bold",
                    color:RcsbAnnotationConstants.provenanceColorCode.rcsbPdb
                }
            };
        }else if(!requestConfig.excludeFirstRowLink && requestConfig.from === SequenceReference.PdbInstance && this.entityInstanceTranslator!=null) {
            rowTitle = {
                visibleTex: this.buildInstanceId(requestConfig.queryId),
                style: {
                    fontWeight:"bold",
                }
            };
        }else{
            rowTitle = {
                visibleTex: requestConfig.queryId,
                style: {
                    fontWeight:"bold",
                }
            };
        }
        return rowTitle;
    }

    public buildAlignmentRowTitle(targetAlignment: TargetAlignment, alignmentData: BuildAlignementsInterface ): string | RcsbFvLink {
        let rowTitle: string | RcsbFvLink;
        if (alignmentData.to === SequenceReference.PdbInstance && this.entityInstanceTranslator != null) {
            const entityId: string = this.entityInstanceTranslator.translateAsymToEntity(targetAlignment.target_id.split(TagDelimiter.instance)[1]);
            rowTitle = {
                visibleTex:this.buildInstanceId(targetAlignment.target_id),
                url:(resource as any).rcsb_entry.url+targetAlignment.target_id.split(TagDelimiter.instance)[0]+"#entity-"+entityId,
                style: {
                    fontWeight:"bold",
                    color:RcsbAnnotationConstants.provenanceColorCode.rcsbPdb
                }
            };
        } else if (alignmentData.to === SequenceReference.PdbEntity && !alignmentData.excludeAlignmentLinks ) {
            const entityId: string = targetAlignment.target_id.split(TagDelimiter.entity)[1];
            rowTitle = {
                visibleTex:targetAlignment.target_id,
                url:(resource as any).rcsb_entry.url+targetAlignment.target_id.split(TagDelimiter.entity)[0]+"#entity-"+entityId,
                style: {
                    fontWeight:"bold",
                    color:RcsbAnnotationConstants.provenanceColorCode.rcsbPdb
                }
            };
        } else if ( alignmentData.to === SequenceReference.PdbInstance && !alignmentData.excludeAlignmentLinks && this.entityInstanceTranslator != null) {
            const entityId: string = this.entityInstanceTranslator.translateAsymToEntity(targetAlignment.target_id.split(TagDelimiter.instance)[1]);
            rowTitle = {
                visibleTex:this.buildInstanceId(targetAlignment.target_id),
                url:(resource as any).rcsb_entry.url+targetAlignment.target_id.split(TagDelimiter.instance)[0]+"#entity-"+entityId,
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
        return rowTitle;
    }

    public addAuthorResIds(e:RcsbFvTrackDataElementInterface, alignmentContext:TranslateContextInterface):RcsbFvTrackDataElementInterface {
        let o:RcsbFvTrackDataElementInterface = e;
        if(this.entityInstanceTranslator!=null){
            this.entityInstanceTranslator.addAuthorResIds(o,alignmentContext);
        }
        if(alignmentContext.to == SequenceReference.PdbInstance && o.sourceId != null)
            o.sourceId = o.sourceId.split(TagDelimiter.instance)[0] + TagDelimiter.instance + this.entityInstanceTranslator.translateAsymToAuth(o.sourceId.split(TagDelimiter.instance)[1])
        return o;
    }

    public buildInstanceId(targetId: string): string{
        const labelAsymId: string = targetId.split(TagDelimiter.instance)[1]
        const authAsymId: string = this.entityInstanceTranslator?.translateAsymToAuth(labelAsymId);
        return (labelAsymId === authAsymId || !authAsymId? labelAsymId : labelAsymId+"[auth "+authAsymId+"]");
    }

    public setPolymerEntityInstanceTranslator(p: PolymerEntityInstanceTranslate): void {
        this.entityInstanceTranslator = p;
    }
}

function findMismatch(seqA: string, seqB: string): Array<number> {
    const out: Array<number> = [];
    if (seqA.length === seqB.length) {
        for (let i = 0; i < seqA.length; i++) {
            if (seqA.charAt(i) !== seqB.charAt(i)) {
                out.push(i);
            }
        }
    }
    return out;
}
