import {
    RcsbFvRowConfigInterface
} from '@rcsb/rcsb-saguaro';

import {
    AnnotationFeatures, Feature
} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbAnnotationConfig} from "../../RcsbAnnotationConfig/RcsbAnnotationConfig";
import {SwissModelQueryAnnotations} from "../../ExternalResources/SwissModel/SwissModelQueryAnnotations";
import {RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/PolymerEntityInstanceTranslate";
import {
    AnnotationCollectConfig,
    AnnotationCollectorInterface
} from "./AnnotationCollectorInterface";
import {AnnotationCollectorHelper} from "./AnnotationCollectorHelper";
import {Subject} from "rxjs";
import {ObservableHelper} from "../../RcsbUtils/ObservableHelper";
import {AnnotationConfigInterface} from "../../RcsbAnnotationConfig/AnnotationConfigInterface";
import {AnnotationTrackManager} from "./AnnotationTrackManager";

export class AnnotationCollector implements AnnotationCollectorInterface{

    private readonly rcsbAnnotationConfig: RcsbAnnotationConfig;
    private readonly annotationsConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();
    readonly rcsbFvQuery: RcsbClient = new RcsbClient();
    private polymerEntityInstanceTranslator:PolymerEntityInstanceTranslate;
    private requestStatus: "pending"|"complete" = "pending";
    private rawFeatures: Array<Feature>;
    private readonly rawFeaturesSubject: Subject<Array<Feature>> = new Subject<Array<Feature>>();
    private readonly annotationsConfigDataSubject: Subject<Array<RcsbFvRowConfigInterface>> = new Subject<Array<RcsbFvRowConfigInterface>>();
    private readonly annotationTrackManager: AnnotationTrackManager;
    private annotationFeatures: Array<AnnotationFeatures>;
    private readonly annotationFeaturesSubject: Subject<Array<AnnotationFeatures>> = new Subject<Array<AnnotationFeatures>>();

    constructor(acm?: AnnotationConfigInterface) {
        this.rcsbAnnotationConfig = new RcsbAnnotationConfig(acm);
        this.annotationTrackManager = new AnnotationTrackManager(this.rcsbAnnotationConfig);
    }

    public async collect(requestConfig: AnnotationCollectConfig): Promise<Array<RcsbFvRowConfigInterface>> {
        this.requestStatus = "pending";
        this.annotationFeatures = await this.requestAnnotations(requestConfig);
        if (requestConfig.collectSwissModel === true) {
            const swissModelData: Array<AnnotationFeatures> = await SwissModelQueryAnnotations.request(requestConfig.queryId);
            this.annotationFeatures = this.annotationFeatures.concat(swissModelData);
        }
        this.processRcsbPdbAnnotations(requestConfig);
        this.rawFeatures = [].concat.apply([], this.annotationFeatures.map(af=>af.features));
        this.complete();
        return this.annotationsConfigData;
    }

    public getPolymerEntityInstanceTranslator(): PolymerEntityInstanceTranslate {
        return this.polymerEntityInstanceTranslator;
    }

    public setPolymerEntityInstanceTranslator(p: PolymerEntityInstanceTranslate): void {
        this.annotationTrackManager.setPolymerEntityInstanceTranslator(p);
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

    public async getAnnotationFeatures(): Promise<Array<AnnotationFeatures>>{
        return new Promise<Array<AnnotationFeatures>>((resolve, reject)=>{
            if(this.requestStatus === "complete"){
                resolve(this.annotationFeatures);
            }else{
                ObservableHelper.oneTimeSubscription<Array<AnnotationFeatures>>(resolve, this.annotationFeaturesSubject);
            }
        })
    }

    private processRcsbPdbAnnotations(requestConfig: AnnotationCollectConfig): void{
        this.annotationTrackManager.processRcsbPdbAnnotations(this.annotationFeatures, requestConfig);
        this.rcsbAnnotationConfig.sortAndIncludeNewTypes();
        [
            this.rcsbAnnotationConfig.instanceOrder(),
            this.rcsbAnnotationConfig.entityOrder(),
            this.rcsbAnnotationConfig.uniprotOrder(),
            Array.from(this.annotationTrackManager.getAnnotationTracks().keys()).filter(type=>!this.rcsbAnnotationConfig.allTypes().has(type))
        ].forEach(annotationGroup=>{
            annotationGroup.forEach(type => {
                if (this.annotationTrackManager.getAnnotationTracks().has(type) && this.annotationTrackManager.getAnnotationTracks().get(type).size > 0)
                    this.annotationsConfigData.push(
                        AnnotationCollectorHelper.buildAnnotationTrack(
                            this.annotationTrackManager.getAnnotationTracks().get(type),
                            type,
                            this.rcsbAnnotationConfig.getConfig(type),
                            this.rcsbAnnotationConfig.getProvenanceList(type)
                        )
                    );
            });
        });
    }

    private async requestAnnotations(requestConfig: AnnotationCollectConfig): Promise<Array<AnnotationFeatures>> {
        return requestConfig.queryId ?
            await this.rcsbFvQuery.requestRcsbPdbAnnotations({
                queryId: requestConfig.queryId,
                reference: requestConfig.reference,
                sources: requestConfig.sources,
                filters: requestConfig.filters,
                range: requestConfig.range
            })
        :
            await this.rcsbFvQuery.requestRcsbPdbGroupAnnotations({
                group: requestConfig.group,
                groupId: requestConfig.groupId,
                sources: requestConfig.sources,
                filters: requestConfig.filters
            });
    }

    private complete(): void {
        this.requestStatus = "complete";
        this.annotationsConfigDataSubject.next(this.annotationsConfigData);
        this.annotationFeaturesSubject.next(this.annotationFeatures);
        this.rawFeaturesSubject.next(this.rawFeatures);
    }

}

