import {AnnotationTransformer} from "./AnnotationTransformer";
import {AnnotationFeatures, Feature, Source} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbAnnotationConfig} from "../../RcsbAnnotationConfig/RcsbAnnotationConfig";
import {RcsbFvColorGradient} from "@rcsb/rcsb-saguaro";
import {TagDelimiter} from "../../RcsbUtils/TagDelimiter";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/PolymerEntityInstanceTranslate";
import {AnnotationCollectConfig} from "./AnnotationCollectorInterface";

export class AnnotationTrackManager {

    private readonly rcsbAnnotationConfig: RcsbAnnotationConfig;
    private readonly annotationTracks: Map<string, AnnotationTransformer> = new Map<string, AnnotationTransformer>();
    private polymerEntityInstanceTranslator:PolymerEntityInstanceTranslate;

    constructor(rcsbAnnotationConfig: RcsbAnnotationConfig) {
        this.rcsbAnnotationConfig = rcsbAnnotationConfig;
    }

    public processRcsbPdbAnnotations(data: Array<AnnotationFeatures>, requestConfig: AnnotationCollectConfig): void{
        requestConfig.externalAnnotationTrackBuilder?.filterFeatures(data);
        data.forEach(ann => {
            ann.features.forEach(d => {
                this.addAnnotationToTracks(requestConfig, ann, d);
            });
        });
        requestConfig.annotationProcessing?.computeAnnotationValue(this.annotationTracks);
        this.mergeTracks();
    }

    public getAnnotationTracks(): Map<string, AnnotationTransformer>{
        return this.annotationTracks;
    }

    private getPolymerEntityInstanceTranslator(): PolymerEntityInstanceTranslate {
        return this.polymerEntityInstanceTranslator;
    }

    public setPolymerEntityInstanceTranslator(p: PolymerEntityInstanceTranslate): void {
        this.polymerEntityInstanceTranslator = p;
    }

    private mergeTracks(): void{
        this.annotationTracks.forEach((locationAnn,type)=>{
            if(this.rcsbAnnotationConfig.isMergedType(type)) {
                const newType: string = this.rcsbAnnotationConfig.getMergedType(type);
                const color: string  | RcsbFvColorGradient = this.rcsbAnnotationConfig.getConfig(type).color as string;
                if(!this.annotationTracks.has(newType))
                    this.annotationTracks.set(newType, new AnnotationTransformer(type, this.rcsbAnnotationConfig.getConfig(type), this.getPolymerEntityInstanceTranslator()));
                this.annotationTracks.get(type).forEach((ann,loc)=>{
                    ann.color = color;
                    this.annotationTracks.get(newType).set(loc,ann);
                    this.rcsbAnnotationConfig.addProvenance(newType,ann.provenanceName);
                });
                this.annotationTracks.delete(type);
            }
        });
    }

    private buildType(requestConfig: AnnotationCollectConfig, ann: AnnotationFeatures, d: Feature): string{
        let type: string;
        if (requestConfig.addTargetInTitle != null && requestConfig.addTargetInTitle.has(ann.source)) {
            let targetId: string = ann.target_id;
            if( this.getPolymerEntityInstanceTranslator() != null && ann.source === Source.PdbInstance){
                const labelAsymId: string = ann.target_id.split(TagDelimiter.instance)[1];
                const authAsymId: string = this.getPolymerEntityInstanceTranslator().translateAsymToAuth(labelAsymId);
                targetId = labelAsymId === authAsymId ? labelAsymId : labelAsymId+"[auth "+authAsymId+"]";
            }
            type = this.rcsbAnnotationConfig.buildAndAddType(d, targetId);
        }else{
            type = this.rcsbAnnotationConfig.buildAndAddType(d);
        }
        return type;
    }

    private addAnnotationToTracks(requestConfig: AnnotationCollectConfig, ann: AnnotationFeatures, d: Feature): void{
        if(this.rcsbAnnotationConfig.getConfig(d.type)?.ignore)
            return;
        const type: string = this.buildType(requestConfig, ann, d);
        if (!this.annotationTracks.has(type)) {
            this.annotationTracks.set(type, new AnnotationTransformer(type, this.rcsbAnnotationConfig.getConfig(type), this.getPolymerEntityInstanceTranslator()));
        }
        this.rcsbAnnotationConfig.addProvenance(type, d.provenance_source);
        //TODO increaseAnnotationValue should be d.type dependant
        this.annotationTracks.get(type).addElement(requestConfig.reference, requestConfig.queryId ?? requestConfig.groupId, ann.source, ann.target_id, d, requestConfig.annotationProcessing?.increaseAnnotationValue);
    }

}