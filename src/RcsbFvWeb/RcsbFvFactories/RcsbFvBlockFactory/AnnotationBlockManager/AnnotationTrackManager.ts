import {
    RcsbFvDisplayTypes,
    RcsbFvTrackDataElementGapInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import {Feature, FeaturePosition, SequenceReference, Source} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {TagDelimiter} from "../../../../RcsbUtils/Helpers/TagDelimiter";
import {PolymerEntityInstanceTranslate, AlignmentContextInterface} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {RcsbAnnotationConfigInterface} from "../../../../RcsbAnnotationConfig/AnnotationConfigInterface";

import {
    AnnotationProcessingInterface, FeaturePositionGaps, IncreaseAnnotationValueType,
    TrackManagerFactoryInterface,
    TrackManagerInterface
} from "./TrackManagerInterface";
import {TrackUtils} from "../../RcsbFvTrackFactory/TrackFactoryImpl/Helper/TrackUtils";


export class AnnotationTrackManagerFactory implements TrackManagerFactoryInterface<[string, RcsbAnnotationConfigInterface, PolymerEntityInstanceTranslate]> {
    getTrackManager(trackId: string, annotationConfig: RcsbAnnotationConfigInterface, entityInstanceTranslator: PolymerEntityInstanceTranslate): TrackManagerInterface {
        return new AnnotationTrackManager(trackId, annotationConfig, entityInstanceTranslator);
    }
}

class AnnotationTrackManager implements TrackManagerInterface {
    private valueRange: {min:number;max:number} = {max:Number.MIN_SAFE_INTEGER, min:Number.MAX_SAFE_INTEGER};
    private readonly entityInstanceTranslator: PolymerEntityInstanceTranslate;
    private readonly type: string;
    private readonly annotationConfig: RcsbAnnotationConfigInterface;
    private readonly trackElementMap: Map<string,RcsbFvTrackDataElementInterface> = new Map<string, RcsbFvTrackDataElementInterface>();

    constructor(type: string, annotationConfig: RcsbAnnotationConfigInterface, entityInstanceTranslator: PolymerEntityInstanceTranslate) {
        this.entityInstanceTranslator = entityInstanceTranslator;
        this.type = type;
        this.annotationConfig = annotationConfig;
    }

    public getId(): string {
        return this.type;
    }

    public getConfig(): RcsbAnnotationConfigInterface {
        return this.annotationConfig;
    }

    public getRange(): {min:number;max:number}{
        return this.valueRange;
    }

    public addFeature(ann:{reference: SequenceReference | undefined, queryId: string, source: Source, targetId:string, feature: Feature}, annotationProcessing?:AnnotationProcessingInterface): void {
        computeFeatureGaps(ann.feature.feature_positions).forEach(p => {
            if(p.beg_seq_id != null) {
                this.annotationRangeKeys(p).forEach(rangeKey=>{
                    this.addRange(ann.reference, ann.queryId, ann.source, ann.targetId, ann.feature, p, rangeKey, annotationProcessing);
                });
            }
        });
    }

    public size(): number{
        return this.trackElementMap.size;
    }

    public forEach(f:(ann:RcsbFvTrackDataElementInterface,loc:string)=>void): void{
        this.trackElementMap.forEach((ann,loc)=>{
            f(ann,loc);
        });
    }

    public addAll(trackElementsMap: TrackManagerInterface, color?: string ): void{
        trackElementsMap.forEach((ann,loc)=>{
            ann.color = color ?? ann.color;
            this.trackElementMap.set(loc,ann);
        })
    }

    public getTrackProvenance(): Set<string> {
        return new Set<string>( Array.from(this.trackElementMap.values()).map(e=>e.provenanceName) );
    }

    public values(): RcsbFvTrackDataElementInterface[]{
        return Array.from(this.trackElementMap.values());
    }

    private buildRcsbFvTrackDataElement(p: FeaturePositionGaps, d: Feature, targetId: string, source:Source, provenance:string): RcsbFvTrackDataElementInterface{
        const title:string = this.annotationConfig.title ?? this.type;
        let value: number|string = undefined;
        if(this.isNumericalDisplay(this.type)) {
            if(this.annotationConfig.transformToNumerical){
                value = 1;
            }else{
                value = p.values instanceof Array ? p.values[0] ?? 0 : 0;
            }
        }

        if(p.values instanceof Array && p.values.length > 0){
            if(Math.max(...p.values) > this.valueRange.max)
                this.valueRange.max = Math.max(...p.values)
            if(Math.min(...p.values) < this.valueRange.min)
                this.valueRange.min = Math.min(...p.values)
        }else if(typeof value === "number"){
            if(value > this.valueRange.max)
                this.valueRange.max = value
            if(value < this.valueRange.min)
                this.valueRange.min = value
        }

        const sourceId: string = source == Source.PdbInstance && this.entityInstanceTranslator != null ?
            TagDelimiter.parseInstance(targetId).entryId + TagDelimiter.instance + this.entityInstanceTranslator.translateAsymToAuth(TagDelimiter.parseInstance(targetId).instanceId) : targetId;

        return {
            begin: p.beg_seq_id,
            end: p.end_seq_id ?? p.beg_seq_id,
            oriBegin: p.beg_ori_id,
            oriEnd: p.end_ori_id ?? p.beg_ori_id,
            description: new Array<string>(),
            featureId: d.feature_id,
            type: this.type,
            title: title,
            name: d.name,
            value: value,
            gValue: d.value,
            gaps: (p.gaps!),
            sourceId: sourceId,
            source: TrackUtils.transformSourceFromTarget(targetId, source),
            provenanceName: provenance,
            provenanceColor: TrackUtils.getProvenanceColorFromProvenance(provenance),
            openBegin: p.open_begin,
            openEnd: p.open_end
        };
    }

    private addRange(reference: SequenceReference | undefined, queryId: string, source: Source, targetId:string, d: Feature, p: FeaturePositionGaps, rangeKey: number[], annotationProcessing?:AnnotationProcessingInterface): void{
        const key: string = rangeKey.join(":");
        if (!this.trackElementMap.has(key)) {
            const a: RcsbFvTrackDataElementInterface = this.buildRcsbFvTrackDataElement(p,d,targetId,source,d.provenance_source);
            if(this.annotationConfig.transformToNumerical)
                this.transformToNumerical(targetId, rangeKey, key, a, d, p, annotationProcessing?.getAnnotationValue);
            if(typeof annotationProcessing?.addTrackElementCallback === "function")
                annotationProcessing.addTrackElementCallback({type:this.type,targetId:targetId,positionKey:key,d:d,p:p})
            const translateContext: AlignmentContextInterface = {
                from:reference,
                to:source,
                queryId:queryId,
                targetId:targetId
            };
            this.addAuthorResIds(a,translateContext);
            this.trackElementMap.set(key,a);
            if(p.values instanceof Array)
                this.expandValues(a, p.values, translateContext);
        }else if(this.isNumericalDisplay(this.type) && this.annotationConfig.transformToNumerical && typeof this.trackElementMap.get(key).value === "number"){
            (this.trackElementMap.get(key).value as number) +=
                typeof annotationProcessing?.getAnnotationValue === "function" ? annotationProcessing.getAnnotationValue({type:this.type,targetId:targetId,positionKey:key,d:d,p:p}) : 1;
            if(this.trackElementMap.get(key).value > this.valueRange.max)
                this.valueRange.max = this.trackElementMap.get(key).value as number;
            if(this.trackElementMap.get(key).value < this.valueRange.min)
                this.valueRange.min = this.trackElementMap.get(key).value as number;
        }
        if(typeof d.description === "string")
            this.trackElementMap.get(key).description.push(d.description);
    }

    private transformToNumerical(targetId:string, rangeKey: number[], key: string,a: RcsbFvTrackDataElementInterface, d: Feature, p:FeaturePositionGaps, getAnnotationValue?:IncreaseAnnotationValueType): void{
        if(typeof getAnnotationValue === "function")
            a.value =  getAnnotationValue({type:this.type,targetId:targetId,positionKey:key,d:d,p:p});
        a.begin = rangeKey[0];
        a.end = rangeKey[0];
    }

    private expandValues(e: RcsbFvTrackDataElementInterface, values: number[], translateContext: AlignmentContextInterface): void{
        values.forEach((v,i)=>{
            if(i>0){
                const key:string = (e.begin+i).toString();
                const a: RcsbFvTrackDataElementInterface = {...e, begin:(e.begin+i), end:null, oriBegin:e.oriBegin ?(e.oriBegin+i) : null, oriEnd:null, value:v};
                this.addAuthorResIds(a, translateContext);
                this.trackElementMap.set(key, a);
            }
        });
    }

    private addAuthorResIds(e:RcsbFvTrackDataElementInterface, annotationContext:AlignmentContextInterface):RcsbFvTrackDataElementInterface {
        const o:RcsbFvTrackDataElementInterface = e;
        if(this.entityInstanceTranslator!=null && annotationContext.from){
            this.entityInstanceTranslator.addAuthorResIds(o,annotationContext);
        }
        return o;
    }

    private isNumericalDisplay(type: string): boolean {
        return (this.annotationConfig!=null && (this.annotationConfig.display === RcsbFvDisplayTypes.AREA || this.annotationConfig.display === RcsbFvDisplayTypes.BLOCK_AREA || this.annotationConfig.display === RcsbFvDisplayTypes.MULTI_AREA || this.annotationConfig.display === RcsbFvDisplayTypes.LINE));
    }

    private annotationRangeKeys(p: FeaturePositionGaps): number[][] {
        const rangeKeys: number[][] = new Array<number[]>();
        if(this.annotationConfig.transformToNumerical && p.end_seq_id != null){
            for(let i=p.beg_seq_id; i<=p.end_seq_id; i++){
                rangeKeys.push([i]);
            }
        }else if(this.annotationConfig.transformToNumerical){
            rangeKeys.push([p.beg_seq_id]);
        }else{
            const key: number[] = p.end_seq_id != null ? [p.beg_seq_id, p.end_seq_id] : [p.beg_seq_id, p.beg_seq_id];
            if(this.annotationConfig.displayCooccurrence) key.push(Math.ceil(Math.random()*1000000000000));
            rangeKeys.push(key);
        }
        return rangeKeys;
    }
}

function computeFeatureGaps(featurePositions: FeaturePosition[]): FeaturePositionGaps[]{
    const rangeIdMap: Map<string,FeaturePosition[]> = new Map<string, FeaturePosition[]>();
    const out: FeaturePositionGaps[] = new Array<FeaturePositionGaps>();
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
            const sorted: FeaturePosition[] = fpList.sort((a,b)=>{
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