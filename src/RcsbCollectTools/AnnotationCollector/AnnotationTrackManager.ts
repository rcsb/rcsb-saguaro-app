import {AnnotationTrack} from "./AnnotationTrack";
import {AnnotationFeatures, Feature, Source} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbAnnotationConfig} from "../../RcsbAnnotationConfig/RcsbAnnotationConfig";
import {RcsbFvColorGradient} from "@rcsb/rcsb-saguaro";
import {TagDelimiter} from "../../RcsbUtils/TagDelimiter";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/PolymerEntityInstanceTranslate";
import {AnnotationCollectConfig} from "./AnnotationCollectorInterface";

export class AnnotationTrackManager {

    private readonly rcsbAnnotationConfig: RcsbAnnotationConfig;
    private readonly annotationTracks: Map<string, AnnotationTrack> = new Map<string, AnnotationTrack>();
    private polymerEntityInstanceTranslator:PolymerEntityInstanceTranslate;

    constructor(rcsbAnnotationConfig: RcsbAnnotationConfig) {
        this.rcsbAnnotationConfig = rcsbAnnotationConfig;
    }

    public processRcsbPdbAnnotations(data: Array<AnnotationFeatures>, requestConfig: AnnotationCollectConfig): void{
        this.addAnnotationToTracks(
            requestConfig,
            typeof requestConfig.externalAnnotationTrackBuilder?.filterFeatures === "function" ? requestConfig.externalAnnotationTrackBuilder?.filterFeatures(data) : data
        );
        requestConfig.annotationProcessing?.computeAnnotationValue(this.annotationTracks);
        this.mergeTracks();
    }

    public getAnnotationTracks(): Map<string, AnnotationTrack>{
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
                    this.annotationTracks.set(newType, new AnnotationTrack(type, this.rcsbAnnotationConfig.getConfig(type), this.getPolymerEntityInstanceTranslator()));
                this.annotationTracks.get(newType).addAll(this.annotationTracks.get(type),color);
                this.rcsbAnnotationConfig.addMultipleProvenance(newType, Array.from(this.annotationTracks.get(newType).getTrackProvenance()));
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

    private addAnnotationToTracks(requestConfig: AnnotationCollectConfig, data: Array<AnnotationFeatures>): void{
        data.forEach(ann => {
            ann.features.forEach(feature => {
                if(this.rcsbAnnotationConfig.getConfig(feature.type)?.ignore)
                    return;
                const type: string = this.buildType(requestConfig, ann, feature);
                if (!this.annotationTracks.has(type)) {
                    this.annotationTracks.set(type, new AnnotationTrack(type, this.rcsbAnnotationConfig.getConfig(type), this.getPolymerEntityInstanceTranslator()));
                }
                this.rcsbAnnotationConfig.addProvenance(type, feature.provenance_source);
                this.annotationTracks.get(type).addFeature({
                        reference: requestConfig.reference,
                        queryId: requestConfig.queryId,
                        source: ann.source,
                        targetId: ann.target_id,
                        feature: feature
                    }, requestConfig.annotationProcessing
                );
            });
        });

    }

}