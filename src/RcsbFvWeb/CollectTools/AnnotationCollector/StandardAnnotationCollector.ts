import {AbstractAnnotationCollector, CollectAnnotationsInterface} from "./AbstractAnnotationCollector";
import {AnnotationFeatures, Source} from "../../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {Constants} from "../../Utils/Constants";
import {AnnotationTransformer} from "./AnnotationTransformer";

export class StandardAnnotationCollector extends AbstractAnnotationCollector {

    protected processRcsbPdbAnnotations(data: Array<AnnotationFeatures>, requestConfig: CollectAnnotationsInterface): void{
        const annotationTracks: Map<string, AnnotationTransformer> = new Map();
        data.forEach(ann => {
            ann.features.forEach(d => {
                let type: string;
                if (requestConfig.addTargetInTitle != null && requestConfig.addTargetInTitle.has(ann.source)) {
                    let targetId: string = ann.target_id;
                    if( this.getPolymerEntityInstance() != null && ann.source === Source.PdbInstance){
                        const labelAsymId: string = ann.target_id.split(Constants.instance)[1];
                        const authAsymId: string = this.getPolymerEntityInstance().translateAsymToAuth(labelAsymId);
                        targetId = labelAsymId === authAsymId ? labelAsymId : labelAsymId+"[auth "+authAsymId+"]";
                    }
                    type = this.rcsbAnnotationConfig.setAnnotationKey(d, targetId);
                }else{
                    type = this.rcsbAnnotationConfig.setAnnotationKey(d);
                }
                if (!annotationTracks.has(type)) {
                    annotationTracks.set(type, new AnnotationTransformer(type, this.rcsbAnnotationConfig.getConfig(type), this.getPolymerEntityInstance()));
                }
                this.rcsbAnnotationConfig.addProvenance(type, d.provenance_source);
                annotationTracks.get(type).addElement(requestConfig.reference, requestConfig.queryId, ann.source, ann.target_id, d);
            });
        });
        this.mergeTracks(annotationTracks);
        this.rcsbAnnotationConfig.sortAndIncludeNewTypes();
        this.rcsbAnnotationConfig.instanceOrder().forEach(type => {
            if (annotationTracks.has(type) && annotationTracks.get(type).size > 0)
                this.annotationsConfigData.push(this.buildAnnotationTrack(annotationTracks.get(type), type));
        });
        this.rcsbAnnotationConfig.entityOrder().forEach(type => {
            if (annotationTracks.has(type) && annotationTracks.get(type).size > 0)
                this.annotationsConfigData.push(this.buildAnnotationTrack(annotationTracks.get(type), type));
        });
        this.rcsbAnnotationConfig.uniprotOrder().forEach(type => {
            if (annotationTracks.has(type) && annotationTracks.get(type).size > 0)
                this.annotationsConfigData.push(this.buildAnnotationTrack(annotationTracks.get(type), type));
        });
        annotationTracks.forEach((data, type) => {
            if (!this.rcsbAnnotationConfig.allTypes().has(type))
                this.annotationsConfigData.push(this.buildAnnotationTrack(data, type));
        });
    }

}