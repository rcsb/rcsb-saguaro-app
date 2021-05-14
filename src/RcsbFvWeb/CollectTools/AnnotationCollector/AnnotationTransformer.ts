import {
    RcsbFvDisplayTypes,
    RcsbFvTrackDataElementGapInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import {Feature, FeaturePosition, SequenceReference, Source} from "../../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbAnnotationConstants} from "../../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {TagDelimiter} from "../../Utils/TagDelimiter";
import {PolymerEntityInstanceTranslate, TranslateContextInterface} from "../../Utils/PolymerEntityInstanceTranslate";
import {RcsbAnnotationConfigInterface} from "../../../RcsbAnnotationConfig/RcsbAnnotationConfig";

interface FeaturePositionGaps extends FeaturePosition {
    gaps?: Array<RcsbFvTrackDataElementGapInterface>;
}

export class AnnotationTransformer extends Map<string,RcsbFvTrackDataElementInterface> {
    private valueRange: {min:number;max:number} = {max:Number.MIN_SAFE_INTEGER, min:Number.MAX_SAFE_INTEGER};
    private readonly entityInstanceTranslator: PolymerEntityInstanceTranslate;
    private readonly type: string;
    private readonly annotationConfig: RcsbAnnotationConfigInterface;

    constructor(type: string, annotationConfig: RcsbAnnotationConfigInterface, entityInstanceTranslator: PolymerEntityInstanceTranslate) {
        super();
        this.entityInstanceTranslator = entityInstanceTranslator;
        this.type = type;
        this.annotationConfig = annotationConfig;
    }

    public getRange(): {min:number;max:number}{
        return this.valueRange;
    }

    public addElement(reference: SequenceReference, queryId: string, source: Source, targetId:string, d: Feature): void{
        computeFeatureGaps(d.feature_positions).forEach(p => {
            if(p.beg_seq_id != null) {
                const key:string = (p.end_seq_id != null ? p.beg_seq_id.toString()+":"+p.end_seq_id.toString() : p.beg_seq_id.toString()) + (this.annotationConfig?.displayCooccurrence ? Math.random().toString(36).substr(2) : "");
                if (!this.has(key)) {
                    const a: RcsbFvTrackDataElementInterface = this.buildRcsbFvTrackDataElement(p,d,targetId,source,d.provenance_source);
                    const translateContext: TranslateContextInterface = {
                        from:reference,
                        to:source,
                        queryId:queryId,
                        targetId:targetId
                    };
                    this.addAuthorResIds(a,translateContext);
                    this.set(key,a);
                    //TODO Needed when value would be mutated into Array
                    /*if(p.value instanceof Array)
                        this.expandValues(a, p.value, translateContext);*/
                }else if(this.isNumericalDisplay(this.type) && this.annotationConfig.transformToNumerical && typeof this.get(key).value === "number"){
                    (this.get(key).value as number) += 1;
                    if(this.get(key).value > this.valueRange.max)
                        this.valueRange.max = this.get(key).value as number;
                    if(this.get(key).value < this.valueRange.min)
                        this.valueRange.min = this.get(key).value as number;
                }
                if(typeof d.description === "string")
                    this.get(key).description.push(d.description);
            }
        });
    }

    private buildRcsbFvTrackDataElement(p: FeaturePositionGaps, d: Feature, targetId: string, source:Source, provenance:string): RcsbFvTrackDataElementInterface{
        let title:string = this.annotationConfig?.title ?? this.type;
        let value: number|string = undefined;
        if(this.isNumericalDisplay(this.type)) {
            if(this.annotationConfig.transformToNumerical){
                value = 1;
            }else{
                //TODO Needed when value would be mutated into Array
                //value = p.value instanceof Array ? p.value[0] ?? 0 : 0;
                value = p.value ?? 0;
            }
        }

        //TODO Needed when value would be mutated into Array
        /*if(p.value instanceof Array){
            if(Math.max(...p.value) > this.valueRange.max)
                this.valueRange.max = Math.max(...p.value)
            if(Math.min(...p.value) < this.valueRange.min)
                this.valueRange.min = Math.min(...p.value)
        }else */if(typeof value === "number"){
            if(value > this.valueRange.max)
                this.valueRange.max = value
            if(value < this.valueRange.min)
                this.valueRange.min = value
        }

        let provenanceColor: string = RcsbAnnotationConstants.provenanceColorCode.external;
        if(provenance === RcsbAnnotationConstants.provenanceName.pdb || provenance === RcsbAnnotationConstants.provenanceName.promotif)
            provenanceColor = RcsbAnnotationConstants.provenanceColorCode.rcsbPdb;
        const sourceId: string = source == Source.PdbInstance && this.entityInstanceTranslator != null ?
            targetId.split(TagDelimiter.instance)[0] + TagDelimiter.instance + this.entityInstanceTranslator.translateAsymToAuth(targetId.split(TagDelimiter.instance)[1]) : targetId;
        return {
            begin: p.beg_seq_id,
            end: p.end_seq_id,
            oriBegin: p.beg_ori_id,
            oriEnd: p.end_ori_id,
            description: new Array<string>(),
            featureId: d.feature_id,
            type: this.type,
            title: title,
            name: d.name,
            value: value,
            gValue: d.value,
            gaps: (p.gaps as Array<RcsbFvTrackDataElementGapInterface>),
            sourceId: sourceId,
            source: source,
            provenanceName: provenance,
            provenanceColor: provenanceColor,
            openBegin: p.open_begin,
            openEnd: p.open_end
        };
    }

    //TODO Needed when value would be mutated into Array
    /*private expandValues(e: RcsbFvTrackDataElementInterface, values: Array<number>, translateContext: TranslateContextInterface): void{
        values.forEach((v,i)=>{
            if(i>0){
                const key:string = (e.begin+i).toString();
                const a: RcsbFvTrackDataElementInterface = {...e, begin:(e.begin+i), end:null, oriBegin:e.oriBegin ?(e.oriBegin+i) : null, oriEnd:null, value:v};
                this.addAuthorResIds(a, translateContext);
                this.set(key, a);
            }
        });
    }*/

    private addAuthorResIds(e:RcsbFvTrackDataElementInterface, annotationContext:TranslateContextInterface):RcsbFvTrackDataElementInterface {
        let o:RcsbFvTrackDataElementInterface = e;
        if(this.entityInstanceTranslator!=null){
            this.entityInstanceTranslator.addAuthorResIds(o,annotationContext);
        }
        return o;
    }

    private isNumericalDisplay(type: string): boolean {
        return (this.annotationConfig!=null && (this.annotationConfig.display === RcsbFvDisplayTypes.AREA || this.annotationConfig.display === RcsbFvDisplayTypes.LINE));
    }
}

function computeFeatureGaps(featurePositions: Array<FeaturePosition>): Array<FeaturePositionGaps>{
    const rangeIdMap: Map<String,Array<FeaturePosition>> = new Map<String, Array<FeaturePosition>>();
    const out: Array<FeaturePositionGaps> = new Array<FeaturePositionGaps>();
    featurePositions.forEach(fp=>{
        if(fp.range_id != null){
            if(!rangeIdMap.has(fp.range_id))
                rangeIdMap.set(fp.range_id, new Array<FeaturePosition>());
            rangeIdMap.get(fp.range_id).push(fp);
        }else{
            out.push(fp)
        }
    });
    rangeIdMap.forEach((fpList,rangeId)=>{
        if(fpList.length ==1){
            out.push(fpList[0])
        }else{
            const sorted: Array<FeaturePosition> = fpList.sort((a,b)=>{
                return a.beg_seq_id-b.beg_seq_id;
            });
            const gapedFeaturePosition: FeaturePositionGaps = {
                ...sorted[0],
                end_seq_id: sorted[ sorted.length-1 ].end_seq_id,
                end_ori_id: sorted[ sorted.length-1 ].end_ori_id,
                open_end: sorted[ sorted.length-1 ].open_end,
                gaps: new Array<RcsbFvTrackDataElementGapInterface>()
            };
            for(let n=0;n<sorted.length-1;n++){
                gapedFeaturePosition.gaps.push({
                    begin:sorted[n].end_seq_id,
                    end:sorted[n+1].beg_seq_id,
                    isConnected: (
                        sorted[n].beg_ori_id == null ||
                        sorted[n].end_ori_id == null ||
                        sorted[n+1].beg_ori_id == null ||
                        sorted[n+1].end_ori_id == null ||
                        sorted[n].end_ori_id+1 == sorted[n+1].beg_ori_id ||
                        sorted[n].end_ori_id == sorted[n+1].beg_ori_id+1 ||
                        sorted[n].end_ori_id == sorted[n+1].beg_ori_id
                    )
                });
            }
            out.push(gapedFeaturePosition);
        }
    });
    return out;
}