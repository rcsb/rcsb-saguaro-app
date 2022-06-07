import {AnnotationFeatures, Feature} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbAnnotationConfig} from "../../../../RcsbAnnotationConfig/RcsbAnnotationConfig";
import {RcsbFvColorGradient} from "@rcsb/rcsb-saguaro";
import {PolymerEntityInstanceTranslate} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {AnnotationRequestContext} from "../../../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {BlockManagerInterface} from "./BlockManagerInterface";
import {TrackManagerFactoryInterface, TrackManagerInterface} from "./TrackManagerInterface";
import {RcsbAnnotationConfigInterface} from "../../../../RcsbAnnotationConfig/AnnotationConfigInterface";

export class AnnotationBlockManager implements BlockManagerInterface<[AnnotationRequestContext,AnnotationFeatures[]]>{

    private readonly rcsbAnnotationConfig: RcsbAnnotationConfig;
    private readonly annotationTracks: Map<string, TrackManagerInterface> = new Map<string, TrackManagerInterface>();
    private readonly polymerEntityInstanceTranslator:PolymerEntityInstanceTranslate;
    private readonly trackManagerFactory: TrackManagerFactoryInterface<[string, RcsbAnnotationConfigInterface, PolymerEntityInstanceTranslate]>;

    constructor(
        trackManagerFactory: TrackManagerFactoryInterface<[string, RcsbAnnotationConfigInterface, PolymerEntityInstanceTranslate]>,
        rcsbAnnotationConfig: RcsbAnnotationConfig,
        polymerEntityInstanceTranslator?: PolymerEntityInstanceTranslate
    ) {
        this.trackManagerFactory = trackManagerFactory;
        this.rcsbAnnotationConfig = rcsbAnnotationConfig;
        this.polymerEntityInstanceTranslator = polymerEntityInstanceTranslator;
    }

    public async setData(requestConfig: AnnotationRequestContext, data: Array<AnnotationFeatures>): Promise<void>{
        await this.addAnnotationToTracks(
            requestConfig,
            typeof requestConfig.externalAnnotationTrackBuilder?.filterFeatures === "function" ?
                await requestConfig.externalAnnotationTrackBuilder?.filterFeatures({annotations: data, rcsbContext: requestConfig.rcsbContext})
                :
                data
        );
        requestConfig.annotationProcessing?.computeAnnotationValue(this.annotationTracks);
        this.mergeTracks();
        this.rcsbAnnotationConfig.sortAndIncludeNewTypes();
    }

    public getTracks(): Array<TrackManagerInterface>{
        return this.orderedTypes().filter(type=>this.has(type) && this.annotationTracks.get(type).size()>0).map(type=>this.annotationTracks.get(type));
    }

    private has(type:string):boolean {
        return this.annotationTracks.has(type);
    }

    private orderedTypes(): string[] {
        return [
            this.rcsbAnnotationConfig.instanceOrder(),
            this.rcsbAnnotationConfig.entityOrder(),
            this.rcsbAnnotationConfig.uniprotOrder(),
            Array.from(this.annotationTracks.keys()).filter(type=>!this.rcsbAnnotationConfig.allTypes().has(type))
        ].flat();
    }

    private async addAnnotationToTracks(requestConfig: AnnotationRequestContext, data: Array<AnnotationFeatures>): Promise<void>{
        await Promise.all(data.map<Promise<void>[]>(ann=>{
            return ann.features.map<Promise<void>>(async feature=>{
                return  await this.addFeature(requestConfig,ann,feature);
            });
        }).flat());
        return void 0;
    }

    private async addFeature(requestConfig: AnnotationRequestContext, ann: AnnotationFeatures, feature: Feature): Promise<void> {
        if(this.rcsbAnnotationConfig.getConfig(feature.type)?.ignore)
            return;
        const type: string = await this.buildType(requestConfig, ann, feature);
        if (!this.annotationTracks.has(type)) {
            this.annotationTracks.set(type, this.trackManagerFactory.getTrackManager(type, this.rcsbAnnotationConfig.getConfig(type), this.polymerEntityInstanceTranslator));
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
    }

    private async buildType(requestConfig: AnnotationRequestContext, ann: AnnotationFeatures, d: Feature): Promise<string>{
        return this.rcsbAnnotationConfig.buildAndAddType(
            d,
            typeof requestConfig.trackTitle === "function" ? (await requestConfig.trackTitle(ann,d)) : undefined,
            typeof requestConfig.titleSuffix === "function" ? (await requestConfig.titleSuffix(ann,d)) : undefined,
            typeof requestConfig.typeSuffix === "function" ? (await requestConfig.typeSuffix(ann,d)) : undefined
        );
    }

    private mergeTracks(): void{
        this.annotationTracks.forEach((locationAnn,type)=>{
            if(this.rcsbAnnotationConfig.isMergedType(type)) {
                const newType: string = this.rcsbAnnotationConfig.getMergedType(type);
                const color: string  | RcsbFvColorGradient = this.rcsbAnnotationConfig.getConfig(type).color as string;
                if(!this.annotationTracks.has(newType))
                    this.annotationTracks.set(newType, this.trackManagerFactory.getTrackManager(type, this.rcsbAnnotationConfig.getConfig(type), this.polymerEntityInstanceTranslator));
                this.annotationTracks.get(newType).addAll(this.annotationTracks.get(type),color);
                this.rcsbAnnotationConfig.addMultipleProvenance(newType, Array.from(this.annotationTracks.get(newType).getTrackProvenance()));
                this.annotationTracks.delete(type);
            }
        });
    }

}