import {AnnotationTrack} from "./AnnotationTrack";
import {AnnotationFeatures, Feature} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbAnnotationConfig} from "../../RcsbAnnotationConfig/RcsbAnnotationConfig";
import {RcsbFvColorGradient} from "@rcsb/rcsb-saguaro";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/PolymerEntityInstanceTranslate";
import {AnnotationCollectConfig} from "./AnnotationCollectorInterface";
import {PolymerEntityInstanceInterface} from "../Translators/PolymerEntityInstancesCollector";

export class AnnotationTrackManager {

    private readonly rcsbAnnotationConfig: RcsbAnnotationConfig;
    private readonly annotationTracks: Map<string, AnnotationTrack> = new Map<string, AnnotationTrack>();
    private polymerEntityInstanceTranslator:PolymerEntityInstanceTranslate;

    constructor(rcsbAnnotationConfig: RcsbAnnotationConfig) {
        this.rcsbAnnotationConfig = rcsbAnnotationConfig;
    }

    public async processRcsbPdbAnnotations(data: Array<AnnotationFeatures>, requestConfig: AnnotationCollectConfig): Promise<void>{
        await this.addAnnotationToTracks(
            requestConfig,
            typeof requestConfig.externalAnnotationTrackBuilder?.filterFeatures === "function" ?
                await requestConfig.externalAnnotationTrackBuilder?.filterFeatures({annotations: data, rcsbContext: requestConfig.rcsbContext})
                :
                data
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

    private async buildType(requestConfig: AnnotationCollectConfig, ann: AnnotationFeatures, d: Feature): Promise<string>{
        return this.rcsbAnnotationConfig.buildAndAddType(
            d,
            typeof requestConfig.trackTitle === "function" ? (await requestConfig.trackTitle(ann,d)) : undefined,
            typeof requestConfig.titleSuffix === "function" ? (await requestConfig.titleSuffix(ann,d)) : undefined,
            typeof requestConfig.typeSuffix === "function" ? (await requestConfig.typeSuffix(ann,d)) : undefined
    );
    }

    private async addAnnotationToTracks(requestConfig: AnnotationCollectConfig, data: Array<AnnotationFeatures>): Promise<void>{
        await Promise.all(data.map<Promise<void>[]>(ann=>{
            return ann.features.map<Promise<void>>(async feature=>{
                return  await this.addFeature(requestConfig,ann,feature);
            });
        }).flat());
        return void 0;
    }

    private async addFeature(requestConfig: AnnotationCollectConfig, ann: AnnotationFeatures, feature: Feature): Promise<void> {
        if(this.rcsbAnnotationConfig.getConfig(feature.type)?.ignore)
            return;
        const type: string = await this.buildType(requestConfig, ann, feature);
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
        )
    }

}