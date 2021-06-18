import {
    RcsbFvColorGradient,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from '@rcsb/rcsb-saguaro';

import {
    AnnotationFeatures,
    Source
} from "../../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbAnnotationConfig} from "../../../RcsbAnnotationConfig/RcsbAnnotationConfig";
import {SwissModelQueryAnnotations} from "../../../ExternalResources/SwissModel/SwissModelQueryAnnotations";
import {TagDelimiter} from "../../Utils/TagDelimiter";
import {AnnotationTransformer} from "./AnnotationTransformer";
import {RcsbClient} from "../../../RcsbGraphQL/RcsbClient";
import {PolymerEntityInstanceTranslate} from "../../Utils/PolymerEntityInstanceTranslate";
import {AnnotationCollectorInterface, CollectAnnotationsInterface} from "./AnnotationCollectorInterface";
import {AnnotationCollectorHelper} from "./AnnotationCollectorHelper";


export class AnnotationCollector implements AnnotationCollectorInterface{

    private readonly rcsbAnnotationConfig: RcsbAnnotationConfig = new RcsbAnnotationConfig();
    private readonly annotationsConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    readonly rcsbFvQuery: RcsbClient = new RcsbClient();
    private polymerEntityInstanceTranslator:PolymerEntityInstanceTranslate;

    public async collect(requestConfig: CollectAnnotationsInterface): Promise<Array<RcsbFvRowConfigInterface>> {
        const annotationFeatures: Array<AnnotationFeatures> = await this.rcsbFvQuery.requestRcsbPdbAnnotations({
            queryId: requestConfig.queryId,
            reference: requestConfig.reference,
            sources: requestConfig.sources,
            filters: requestConfig.filters,
            range: requestConfig.range
        });
        this.processRcsbPdbAnnotations(annotationFeatures, requestConfig);
        if (requestConfig.collectSwissModel === true) {
            const swissModelData = await SwissModelQueryAnnotations.request(requestConfig.queryId)
            this.processRcsbPdbAnnotations(swissModelData, requestConfig);
        }
        return this.annotationsConfigData;
    }

    public getPolymerEntityInstanceTranslator(): PolymerEntityInstanceTranslate {
        return this.polymerEntityInstanceTranslator;
    }

    public setPolymerEntityInstanceTranslator(p: PolymerEntityInstanceTranslate): void {
        this.polymerEntityInstanceTranslator = p;
    }

    private processRcsbPdbAnnotations(data: Array<AnnotationFeatures>, requestConfig: CollectAnnotationsInterface): void{
        const annotationTracks: Map<string, AnnotationTransformer> = new Map();
        data.forEach(ann => {
            ann.features.forEach(d => {
                if(this.rcsbAnnotationConfig.getConfig(d.type)?.ignore)
                    return;
                let type: string;
                if (requestConfig.addTargetInTitle != null && requestConfig.addTargetInTitle.has(ann.source)) {
                    let targetId: string = ann.target_id;
                    if( this.getPolymerEntityInstanceTranslator() != null && ann.source === Source.PdbInstance){
                        const labelAsymId: string = ann.target_id.split(TagDelimiter.instance)[1];
                        const authAsymId: string = this.getPolymerEntityInstanceTranslator().translateAsymToAuth(labelAsymId);
                        targetId = labelAsymId === authAsymId ? labelAsymId : labelAsymId+"[auth "+authAsymId+"]";
                    }
                    type = this.rcsbAnnotationConfig.setAnnotationKey(d, targetId);
                }else{
                    type = this.rcsbAnnotationConfig.setAnnotationKey(d);
                }
                if (!annotationTracks.has(type)) {
                    annotationTracks.set(type, new AnnotationTransformer(type, this.rcsbAnnotationConfig.getConfig(type), this.getPolymerEntityInstanceTranslator()));
                }
                this.rcsbAnnotationConfig.addProvenance(type, d.provenance_source);
                annotationTracks.get(type).addElement(requestConfig.reference, requestConfig.queryId, ann.source, ann.target_id, d);
            });
        });
        this.mergeTracks(annotationTracks);
        this.rcsbAnnotationConfig.sortAndIncludeNewTypes();
        [
            this.rcsbAnnotationConfig.instanceOrder(),
            this.rcsbAnnotationConfig.entityOrder(),
            this.rcsbAnnotationConfig.uniprotOrder(),
            Array.from(annotationTracks.keys()).filter(type=>!this.rcsbAnnotationConfig.allTypes().has(type))
        ].forEach(annotationGroup=>{
            annotationGroup.forEach(type => {
                if (annotationTracks.has(type) && annotationTracks.get(type).size > 0)
                    this.annotationsConfigData.push(AnnotationCollectorHelper.buildAnnotationTrack(annotationTracks.get(type), type, this.rcsbAnnotationConfig.getConfig(type), this.rcsbAnnotationConfig.getProvenanceList(type)));
            });
        });
    }

    private mergeTracks(annotationTracks: Map<string, Map<string, RcsbFvTrackDataElementInterface>>): void{
        annotationTracks.forEach((locationAnn,type)=>{
            if(this.rcsbAnnotationConfig.isMergedType(type)) {
                const newType: string = this.rcsbAnnotationConfig.getMergedType(type);
                const color: string  | RcsbFvColorGradient = this.rcsbAnnotationConfig.getConfig(type).color as string;
                if(!annotationTracks.has(newType))
                    annotationTracks.set(newType, new Map<string, RcsbFvTrackDataElementInterface>());
                annotationTracks.get(type).forEach((ann,loc)=>{
                    ann.color = color;
                    annotationTracks.get(newType).set(loc,ann);
                    this.rcsbAnnotationConfig.addProvenance(newType,ann.provenanceName);
                });
                annotationTracks.delete(type);
            }
        });
    }

}

