import {AbstractCollector, CollectAnnotationsInterface} from "./AbstractCollector";
import {AnnotationFeatures, Source} from "../../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {TagDelimiter} from "../../Utils/TagDelimiter";

export class StandardCollector extends AbstractCollector {

    protected processRcsbPdbAnnotations(data: Array<AnnotationFeatures>, requestConfig: CollectAnnotationsInterface): void{
        const annotations: Map<string, Map<string,RcsbFvTrackDataElementInterface>> = new Map();
        data.forEach(ann => {
            ann.features.forEach(d => {
                let type: string;
                if (requestConfig.addTargetInTitle != null && requestConfig.addTargetInTitle.has(ann.source)) {
                    let targetId: string = ann.target_id;
                    if( this.getPolymerEntityInstance() != null && ann.source === Source.PdbInstance){
                        const labelAsymId: string = ann.target_id.split(TagDelimiter.instance)[1];
                        const authAsymId: string = this.getPolymerEntityInstance().translateAsymToAuth(labelAsymId);
                        targetId = labelAsymId === authAsymId ? labelAsymId : labelAsymId+"[auth "+authAsymId+"]";
                    }
                    type = this.rcsbAnnotationMap.setAnnotationKey(d, targetId);
                }else{
                    type = this.rcsbAnnotationMap.setAnnotationKey(d);
                }
                if (!annotations.has(type)) {
                    annotations.set(type, new Map<string,RcsbFvTrackDataElementInterface>());
                    this.maxValue.set(type,Number.MIN_SAFE_INTEGER);
                    this.minValue.set(type,Number.MAX_SAFE_INTEGER);
                }
                this.computeFeatureGaps(d.feature_positions).forEach(p => {
                    if(p.beg_seq_id != null) {
                        const key:string = p.end_seq_id != null ? p.beg_seq_id.toString()+":"+p.end_seq_id.toString() : p.beg_seq_id.toString();
                        if (!annotations.get(type).has(key)) {
                            const a: RcsbFvTrackDataElementInterface = this.buildRcsbFvTrackDataElement(p,d,ann.target_id,ann.source,type,d.provenance_source);
                            this.addAuthorResIds(a,{
                                from:requestConfig.reference,
                                to:ann.source,
                                queryId:requestConfig.queryId,
                                targetId:ann.target_id
                            });
                            annotations.get(type).set(key,a);
                        }else if(this.isNumericalDisplay(type) && this.rcsbAnnotationMap.isTransformedToNumerical(type)){
                            (annotations.get(type).get(key).value as number) += 1;
                            if(annotations.get(type).get(key).value > this.maxValue.get(type))
                                this.maxValue.set(type, annotations.get(type).get(key).value as number);
                            if(annotations.get(type).get(key).value < this.minValue.get(type))
                                this.minValue.set(type, annotations.get(type).get(key).value as number);
                        }
                        if(typeof d.description === "string")
                            annotations.get(type).get(key).description.push(d.description);
                    }
                });
            });
        });
        this.mergeTypes(annotations);
        this.rcsbAnnotationMap.sortAndIncludeNewTypes();
        this.rcsbAnnotationMap.instanceOrder().forEach(type => {
            if (annotations.has(type) && annotations.get(type).size > 0)
                this.annotationsConfigData.push(this.buildAnnotationTrack(Array.from<RcsbFvTrackDataElementInterface>(annotations.get(type).values()), type));
        });
        this.rcsbAnnotationMap.entityOrder().forEach(type => {
            if (annotations.has(type) && annotations.get(type).size > 0)
                this.annotationsConfigData.push(this.buildAnnotationTrack(Array.from<RcsbFvTrackDataElementInterface>(annotations.get(type).values()), type));
        });
        this.rcsbAnnotationMap.uniprotOrder().forEach(type => {
            if (annotations.has(type) && annotations.get(type).size > 0)
                this.annotationsConfigData.push(this.buildAnnotationTrack(Array.from<RcsbFvTrackDataElementInterface>(annotations.get(type).values()), type));
        });
        annotations.forEach((data, type) => {
            if (!this.rcsbAnnotationMap.allTypes().has(type))
                this.annotationsConfigData.push(this.buildAnnotationTrack(Array.from<RcsbFvTrackDataElementInterface>(data.values()), type));
        });
    }

}