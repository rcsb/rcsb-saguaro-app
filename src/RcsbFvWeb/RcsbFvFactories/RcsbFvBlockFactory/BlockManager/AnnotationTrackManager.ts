import {
    RcsbFvTrackDataElementGapInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro/lib/RcsbDataManager/RcsbDataManager";

import {RcsbFvDisplayTypes} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {Features, FeaturesFeaturePositions, SequenceReference, AnnotationReference} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {PolymerEntityInstanceTranslate, AlignmentContextInterface} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {RcsbAnnotationConfigInterface} from "../../../../RcsbAnnotationConfig/AnnotationConfigInterface";
import {AnnotationProcessingInterface, IncreaseAnnotationValueType} from "../../../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {TrackManagerFactoryInterface, TrackManagerInterface} from "./TrackManagerInterface";
import {TrackUtils} from "../../RcsbFvTrackFactory/TrackFactoryImpl/Helper/TrackUtils";
import {Assertions} from "../../../../RcsbUtils/Helpers/Assertions";
import assertElementListDefined = Assertions.assertElementListDefined;
import assertDefined = Assertions.assertDefined;
import {TagDelimiter} from "@rcsb/rcsb-api-tools/build/RcsbUtils/TagDelimiter";
import {RcsbFvTrackDataAnnotationInterface} from "../../RcsbFvTrackFactory/RcsbFvTrackDataAnnotationInterface";

export interface FeaturePositionGaps extends FeaturesFeaturePositions {
    gaps?: Array<RcsbFvTrackDataElementGapInterface>;
}

export class AnnotationTrackManagerFactory implements TrackManagerFactoryInterface<[string, RcsbAnnotationConfigInterface, PolymerEntityInstanceTranslate]> {
    getTrackManager(trackId: string, annotationConfig: RcsbAnnotationConfigInterface, entityInstanceTranslator?: PolymerEntityInstanceTranslate): TrackManagerInterface {
        return new AnnotationTrackManager(trackId, annotationConfig, entityInstanceTranslator);
    }
}

class AnnotationTrackManager implements TrackManagerInterface {
    private valueRange: {min:number;max:number} = {max:Number.MIN_SAFE_INTEGER, min:Number.MAX_SAFE_INTEGER};
    private readonly entityInstanceTranslator?: PolymerEntityInstanceTranslate;
    private readonly type: string;
    private readonly annotationConfig: RcsbAnnotationConfigInterface;
    private readonly trackElementMap: Map<string,RcsbFvTrackDataAnnotationInterface> = new Map();

    constructor(type: string, annotationConfig: RcsbAnnotationConfigInterface, entityInstanceTranslator?: PolymerEntityInstanceTranslate) {
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

    public addFeature(ann:{reference: SequenceReference | undefined, queryId: string, source: AnnotationReference, targetId:string, feature: Features}, annotationProcessing?:AnnotationProcessingInterface): void {
        assertElementListDefined(ann.feature.feature_positions);
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
        return new Set<string>( Array.from(this.trackElementMap.values()).map(e=>e.provenanceName).filter((x): x is string => x!=null) );
    }

    public values(): Array<RcsbFvTrackDataElementInterface>{
        return Array.from(this.trackElementMap.values());
    }

    private buildRcsbFvTrackDataElement(p: FeaturePositionGaps, d: Features, targetId: string, source:AnnotationReference, provenance?:string): RcsbFvTrackDataAnnotationInterface{
        let title:string = this.annotationConfig?.title ?? this.type;
        let value: number | undefined = undefined;
        if(this.isNumericalDisplay(this.type)) {
            if(this.annotationConfig?.transformToNumerical){
                value = 1;
            }else{
                value = Array.isArray(p.values) && p.values[0] ? p.values[0] : 0;
            }
        }

        if(Array.isArray(p.values)  && p.values.length > 0){
            assertElementListDefined(p.values);
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

        const sourceId: string = source == AnnotationReference.PdbInstance && this.entityInstanceTranslator != null ?
            TagDelimiter.parseInstance(targetId).entryId + TagDelimiter.instance + this.entityInstanceTranslator.translateAsymToAuth(TagDelimiter.parseInstance(targetId).instanceId) : targetId;

        assertDefined(p.beg_seq_id);
        return {
            begin: p.beg_seq_id,
            end: p.end_seq_id ?? p.beg_seq_id,
            oriBegin: p.beg_ori_id ?? undefined,
            oriEnd: (p.end_ori_id ?? p.beg_ori_id) ?? undefined,
            description: new Array<string>(),
            featureId: d.feature_id ?? undefined,
            type: this.type,
            title: title,
            name: d.name ?? undefined,
            value: value,
            gaps: (p.gaps as Array<RcsbFvTrackDataElementGapInterface>),
            sourceId: sourceId,
            source: TrackUtils.transformSourceFromTarget(targetId, source),
            provenanceName: provenance,
            provenanceColor: TrackUtils.getProvenanceColorFromProvenance(provenance),
            openBegin: p.open_begin ?? undefined,
            openEnd: p.open_end ?? undefined
        };
    }

    private addRange(reference: SequenceReference | undefined, queryId: string, source: AnnotationReference, targetId:string, d: Features, p: FeaturePositionGaps, rangeKey: number[], annotationProcessing?:AnnotationProcessingInterface): void{
        const key: string = rangeKey.join(":");
        if (!this.trackElementMap.has(key)) {
            const a: RcsbFvTrackDataElementInterface = this.buildRcsbFvTrackDataElement(p,d,targetId,source,d.provenance_source??undefined);
            if(this.annotationConfig?.transformToNumerical)
                this.transformToNumerical(targetId, rangeKey, key, a, d, p, annotationProcessing?.getAnnotationValue);
            if(typeof annotationProcessing?.addTrackElementCallback === "function")
                annotationProcessing?.addTrackElementCallback({type:this.type,targetId:targetId,positionKey:key,d:d,p:p})
            const translateContext: AlignmentContextInterface = {
                from:reference,
                to:source,
                queryId:queryId,
                targetId:targetId
            };
            this.addAuthorResIds(a,translateContext);
            this.trackElementMap.set(key,a);
            if(Array.isArray(p.values)) {
                assertElementListDefined(p.values);
                this.expandValues(a, p.values, translateContext);
            }
        }else if(this.isNumericalDisplay(this.type) && this.annotationConfig?.transformToNumerical && typeof this.trackElementMap.get(key)?.value === "number"){
            const o = this.trackElementMap.get(key);
            assertDefined(o?.value);
            if(typeof o.value !== "number")
                return;
            o.value += typeof annotationProcessing?.getAnnotationValue === "function" ? annotationProcessing.getAnnotationValue({type:this.type,targetId:targetId,positionKey:key,d:d,p:p}) : 1;
            if(o.value > this.valueRange.max)
                this.valueRange.max = o.value;
            if(o.value < this.valueRange.min)
                this.valueRange.min = o.value;
        }
        if(typeof d.description === "string") {
            const o = this.trackElementMap.get(key)
            if(o) {
                if(!o.description)
                    o.description = [];
                o.description.push(d.description);
            }
        }
    }

    private transformToNumerical(targetId:string, rangeKey: Array<number>, key: string,a: RcsbFvTrackDataElementInterface, d: Features, p:FeaturePositionGaps, getAnnotationValue?:IncreaseAnnotationValueType): void{
        if(typeof getAnnotationValue === "function")
            a.value =  getAnnotationValue({type:this.type,targetId:targetId,positionKey:key,d:d,p:p});
        a.begin = rangeKey[0];
        a.end = rangeKey[0];
    }

    private expandValues(
        e: RcsbFvTrackDataAnnotationInterface,
        values: Array<number>,
        translateContext: AlignmentContextInterface
    ): void{
        values.forEach((v,i)=>{
            if(i>0){
                const key:string = (e.begin+i).toString();
                const a:RcsbFvTrackDataAnnotationInterface = {
                    ...e,
                    begin:(e.begin+i),
                    end:undefined,
                    oriBegin:e.oriBegin ?(e.oriBegin+i) : undefined,
                    oriEnd:undefined,
                    value:v
                };
                this.addAuthorResIds(a, translateContext);
                this.trackElementMap.set(key, a);
            }
        });
    }

    private addAuthorResIds(e:RcsbFvTrackDataElementInterface, annotationContext:AlignmentContextInterface):RcsbFvTrackDataElementInterface {
        let o:RcsbFvTrackDataElementInterface = e;
        if(this.entityInstanceTranslator!=null && annotationContext.from){
            this.entityInstanceTranslator.addAuthorResIds(o,annotationContext);
        }
        return o;
    }

    private isNumericalDisplay(type: string): boolean {
        return (this.annotationConfig!=null && (this.annotationConfig.display === RcsbFvDisplayTypes.AREA || this.annotationConfig.display === RcsbFvDisplayTypes.BLOCK_AREA || this.annotationConfig.display === RcsbFvDisplayTypes.MULTI_AREA || this.annotationConfig.display === RcsbFvDisplayTypes.LINE));
    }

    private annotationRangeKeys(p: FeaturePositionGaps): Array<number[]> {
        const rangeKeys: Array<number[]> = new Array<number[]>();
        if(this.annotationConfig?.transformToNumerical && p.beg_seq_id && p.end_seq_id != null){
            for(let i=p.beg_seq_id; i<=p.end_seq_id; i++){
                rangeKeys.push([i]);
            }
        }else if(this.annotationConfig?.transformToNumerical && p.beg_seq_id){
            rangeKeys.push([p.beg_seq_id]);
        }else if(p.beg_seq_id){
            const key: Array<number> = p.end_seq_id != null ? [p.beg_seq_id, p.end_seq_id] : [p.beg_seq_id, p.beg_seq_id];
            if(this.annotationConfig?.displayCooccurrence) key.push(Math.ceil(Math.random()*1000000000000));
            rangeKeys.push(key);
        }
        return rangeKeys;
    }
}

function computeFeatureGaps(featurePositions: Array<FeaturesFeaturePositions>): Array<FeaturePositionGaps>{
    const rangeIdMap: Map<String,Array<FeaturesFeaturePositions>> = new Map<String, Array<FeaturesFeaturePositions>>();
    const out: Array<FeaturePositionGaps> = new Array<FeaturePositionGaps>();
    featurePositions.forEach(fp=>{
        if(fp.range_id != null){
            if(!rangeIdMap.has(fp.range_id))
                rangeIdMap.set(fp.range_id, new Array<FeaturesFeaturePositions>());
            rangeIdMap.get(fp.range_id)?.push(fp);
        }else{
            out.push(fp)
        }
    });
    rangeIdMap.forEach((fpList,rangeId)=>{
        if(fpList.length ==1){
            out.push(fpList[0])
        }else{
            const sorted: Array<FeaturesFeaturePositions> = fpList.sort((a,b)=>{
                if(a.beg_seq_id && b.beg_seq_id)
                    return a.beg_seq_id-b.beg_seq_id;
                return Number.MAX_SAFE_INTEGER;
            });
            const gapedFeaturePosition: FeaturePositionGaps = {
                ...sorted[0],
                end_seq_id: sorted[ sorted.length-1 ].end_seq_id,
                end_ori_id: sorted[ sorted.length-1 ].end_ori_id,
                open_end: sorted[ sorted.length-1 ].open_end,
                gaps: new Array<RcsbFvTrackDataElementGapInterface>()
            };
            for(let n=0;n<sorted.length-1;n++){
                const prevEnd = sorted[n].end_seq_id;
                const nextBeg = sorted[n+1].beg_seq_id;
                if(prevEnd &&nextBeg)
                    gapedFeaturePosition?.gaps?.push({
                        begin: prevEnd,
                        end: nextBeg,
                        isConnected: (
                            sorted[n].beg_ori_id == null ||
                            sorted[n].end_ori_id == null ||
                            sorted[n+1].beg_ori_id == null ||
                            sorted[n+1].end_ori_id == null ||
                            (sorted[n].end_ori_id ?? Number.MIN_SAFE_INTEGER)+1 == sorted[n+1].beg_ori_id ||
                            sorted[n].end_ori_id == (sorted[n+1].beg_ori_id ?? Number.MIN_SAFE_INTEGER)+1 ||
                            sorted[n].end_ori_id == sorted[n+1].beg_ori_id
                        )
                    });
            }
            out.push(gapedFeaturePosition);
        }
    });
    return out;
}