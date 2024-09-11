import {RcsbFvDisplayTypes} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvColorGradient} from "@rcsb/rcsb-saguaro/lib/RcsbDataManager/RcsbDataManager";
import {
    SequenceAnnotations,
    Features
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbAnnotationConfig} from "../../../../RcsbAnnotationConfig/RcsbAnnotationConfig";
import {PolymerEntityInstanceTranslate} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {AnnotationRequestContext} from "../../../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {BlockManagerInterface} from "./BlockManagerInterface";
import {TrackManagerFactoryInterface, TrackManagerInterface} from "./TrackManagerInterface";
import {RcsbAnnotationConfigInterface} from "../../../../RcsbAnnotationConfig/AnnotationConfigInterface";
import {Assertions} from "../../../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;

export class AnnotationBlockManager implements BlockManagerInterface<[AnnotationRequestContext,SequenceAnnotations[]]>{

    private readonly rcsbAnnotationConfig: RcsbAnnotationConfig;
    private readonly annotationTracks: Map<string, TrackManagerInterface> = new Map<string, TrackManagerInterface>();
    private readonly polymerEntityInstanceTranslator?:PolymerEntityInstanceTranslate;
    private readonly trackManagerFactory: TrackManagerFactoryInterface<[string, RcsbAnnotationConfigInterface, PolymerEntityInstanceTranslate|undefined]>;

    constructor(
        trackManagerFactory: TrackManagerFactoryInterface<[string, RcsbAnnotationConfigInterface, PolymerEntityInstanceTranslate]>,
        rcsbAnnotationConfig: RcsbAnnotationConfig,
        polymerEntityInstanceTranslator?: PolymerEntityInstanceTranslate
    ) {
        this.trackManagerFactory = trackManagerFactory;
        this.rcsbAnnotationConfig = rcsbAnnotationConfig;
        this.polymerEntityInstanceTranslator = polymerEntityInstanceTranslator;
    }

    public async setData(requestConfig: AnnotationRequestContext, data: Array<SequenceAnnotations>): Promise<void>{
        await this.processAnnotations(requestConfig, data);
        this.mergeTracks();
    }

    public getTracks(): Array<TrackManagerInterface>{
        return this.orderedTypes()
                .filter(type=>this.has(type) && (this.annotationTracks.get(type)?.size() ?? 0)>0)
                .map(type=>this.annotationTracks.get(type))
                .filter((track): track is TrackManagerInterface => track!=null) ?? [];
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

    private async processAnnotations(requestConfig: AnnotationRequestContext, data: Array<SequenceAnnotations>): Promise<void>{
        await Promise.all(data.map<Promise<void>[]>(ann=>{
                return ann.features?.map<Promise<void>>(async feature=>{
                    if(feature)
                        return  await this.addFeature(requestConfig,ann,feature);
                }) ?? [];
            }).flat()
        );
        requestConfig.annotationProcessing?.computeAnnotationValue?.(this.annotationTracks);
    }

    private async addFeature(requestConfig: AnnotationRequestContext, ann: SequenceAnnotations, feature: Features): Promise<void> {
        if(feature.type && this.rcsbAnnotationConfig.getConfig(feature.type)?.ignore)
            return;

        const type: string = await this.rcsbAnnotationConfig.getAnnotationType(requestConfig, ann, feature);
        if (!this.annotationTracks.has(type)) {
            const o: RcsbAnnotationConfigInterface = this.rcsbAnnotationConfig.getConfig(type) ?? {
                type: type,
                display: RcsbFvDisplayTypes.BLOCK,
                title: type,
                provenanceList: new Set<string>()
            };
            assertDefined(o, `Unknown type: ${type}`);
            this.annotationTracks.set(type, this.trackManagerFactory.getTrackManager(type, o, this.polymerEntityInstanceTranslator));
        }

        const queryId = requestConfig.queryId ?? requestConfig.groupId;
        assertDefined(queryId, "undefined queryId or groupId");
        assertDefined(ann.source, "undefined source");
        assertDefined(ann.target_id, "undefined target_id");
        this.annotationTracks.get(type)?.addFeature({
                reference: requestConfig.reference ?? undefined,
                queryId: queryId,
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
                const newType: string | undefined = this.rcsbAnnotationConfig.getMergeConfig(type)?.type;
                assertDefined(newType)
                const color: string  | RcsbFvColorGradient | undefined = this.rcsbAnnotationConfig.getConfig(type)?.color;
                if(!this.annotationTracks.has(newType)){
                    const o = this.rcsbAnnotationConfig.getConfig(newType);
                    assertDefined(o);
                    this.annotationTracks.set(
                        newType,
                        this.trackManagerFactory.getTrackManager(newType, o, this.polymerEntityInstanceTranslator)
                    );
                }
                const o = this.annotationTracks.get(type);
                if(o && typeof color === "string")
                    this.annotationTracks.get(newType)?.addAll(o,color);
                this.rcsbAnnotationConfig.addMultipleProvenance(newType, Array.from(this.annotationTracks.get(newType)?.getTrackProvenance() ?? []));
                this.annotationTracks.delete(type);
            }
        });
    }

}