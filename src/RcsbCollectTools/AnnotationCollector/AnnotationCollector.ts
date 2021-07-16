import {
    RcsbFvColorGradient,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from '@rcsb/rcsb-saguaro';

import {
    AnnotationFeatures, Feature,
    Source
} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbAnnotationConfig} from "../../RcsbAnnotationConfig/RcsbAnnotationConfig";
import {SwissModelQueryAnnotations} from "../../ExternalResources/SwissModel/SwissModelQueryAnnotations";
import {TagDelimiter} from "../../RcsbUtils/TagDelimiter";
import {AnnotationTransformer} from "./AnnotationTransformer";
import {RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/PolymerEntityInstanceTranslate";
import {AnnotationCollectorInterface, CollectAnnotationsInterface} from "./AnnotationCollectorInterface";
import {AnnotationCollectorHelper} from "./AnnotationCollectorHelper";
import {Subject} from "rxjs";
import {ObservableHelper} from "../../RcsbUtils/ObservableHelper";


export class AnnotationCollector implements AnnotationCollectorInterface{

    private readonly rcsbAnnotationConfig: RcsbAnnotationConfig = new RcsbAnnotationConfig();
    private readonly annotationsConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    readonly rcsbFvQuery: RcsbClient = new RcsbClient();
    private polymerEntityInstanceTranslator:PolymerEntityInstanceTranslate;
    private requestStatus: "pending"|"complete" = "pending";
    private rawFeatures: Array<Feature>;

    private readonly rawFeaturesSubject: Subject<Array<Feature>> = new Subject<Array<Feature>>();
    private readonly annotationsConfigDataSubject: Subject<Array<RcsbFvRowConfigInterface>> = new Subject<Array<RcsbFvRowConfigInterface>>();

    public async collect(requestConfig: CollectAnnotationsInterface): Promise<Array<RcsbFvRowConfigInterface>> {
        this.requestStatus = "pending";
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
        this.rawFeatures = [].concat.apply([], annotationFeatures.map(af=>af.features));
        this.complete();
        return this.annotationsConfigData;
    }

    public getPolymerEntityInstanceTranslator(): PolymerEntityInstanceTranslate {
        return this.polymerEntityInstanceTranslator;
    }

    public setPolymerEntityInstanceTranslator(p: PolymerEntityInstanceTranslate): void {
        this.polymerEntityInstanceTranslator = p;
    }

    public async getFeatures(): Promise<Array<Feature>>{
        return new Promise<Array<Feature>>((resolve, reject)=>{
            if(this.requestStatus === "complete"){
                resolve(this.rawFeatures);
            }else{
                ObservableHelper.oneTimeSubscription<Array<Feature>>(resolve, this.rawFeaturesSubject);
            }
        });
    }

    public async getAnnotationConfigData(): Promise<Array<RcsbFvRowConfigInterface>>{
        return new Promise<Array<RcsbFvRowConfigInterface>>((resolve, reject)=>{
            if(this.requestStatus === "complete"){
                resolve(this.annotationsConfigData);
            }else{
                ObservableHelper.oneTimeSubscription<Array<RcsbFvRowConfigInterface>>(resolve, this.annotationsConfigDataSubject);
            }
        })
    }

    private complete(): void {
        this.requestStatus = "complete";
        this.annotationsConfigDataSubject.next(this.annotationsConfigData);
        this.rawFeaturesSubject.next(this.rawFeatures);
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

