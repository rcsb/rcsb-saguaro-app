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
        await this.processAnnotations(requestConfig, data);
        this.mergeTracks();
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

    private async processAnnotations(requestConfig: AnnotationRequestContext, data: Array<AnnotationFeatures>): Promise<void>{
        if(typeof requestConfig.externalAnnotationTrackBuilder?.filterFeatures === "function")
            data = await requestConfig.externalAnnotationTrackBuilder?.filterFeatures({annotations: data, rcsbContext: requestConfig.rcsbContext});
        await Promise.all(data.map<Promise<void>[]>(ann=>{
            return ann.features.map<Promise<void>>(async feature=>{
                return  await this.addFeature(requestConfig,ann,feature);
            });
        }).flat());
        requestConfig.annotationProcessing?.computeAnnotationValue(this.annotationTracks);
        return void 0;
    }

    private async addFeature(requestConfig: AnnotationRequestContext, ann: AnnotationFeatures, feature: Feature): Promise<void> {
        if(this.rcsbAnnotationConfig.getConfig(feature.type)?.ignore)
            return;

        const type: string = await this.rcsbAnnotationConfig.getAnnotationType(requestConfig, ann, feature);
        if (!this.annotationTracks.has(type))
            this.annotationTracks.set(type, this.trackManagerFactory.getTrackManager(type, this.rcsbAnnotationConfig.getConfig(type), this.polymerEntityInstanceTranslator));

        this.annotationTracks.get(type).addFeature({
                reference: requestConfig.reference,
                queryId: requestConfig.queryId,
                source: ann.source,
                targetId: ann.target_id,
                feature: feature
            }, requestConfig.annotationProcessing
        );
    }

    private mergeTracks(): void{
        const typeList: string[] = Array.from(this.annotationTracks.keys());
        typeList.forEach((type)=>{
            if(this.rcsbAnnotationConfig.isMergedType(type)) {
                const newType: string = this.rcsbAnnotationConfig.getMergeConfig(type).type;
                const color: string  | RcsbFvColorGradient = this.rcsbAnnotationConfig.getConfig(type).color as string;
                if(!this.annotationTracks.has(newType))
                    this.annotationTracks.set(
                        newType,
                        this.trackManagerFactory.getTrackManager(newType,{...this.rcsbAnnotationConfig.getConfig(newType)}, this.polymerEntityInstanceTranslator)
                    );
                this.annotationTracks.get(newType).addAll(this.annotationTracks.get(type),color);
                this.rcsbAnnotationConfig.addMultipleProvenance(newType, Array.from(this.annotationTracks.get(newType).getTrackProvenance()));
                this.annotationTracks.delete(type);
            }
        });
    }

}