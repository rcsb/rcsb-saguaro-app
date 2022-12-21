import {
    AnnotationFeatures, Feature
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {rcsbClient, RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {
    AnnotationRequestContext,
    AnnotationCollectorInterface
} from "./AnnotationCollectorInterface";
import {Subject} from "rxjs";
import {ObservableHelper} from "../../RcsbUtils/Helpers/ObservableHelper";

export class AnnotationCollector implements AnnotationCollectorInterface{

    readonly rcsbFvQuery: RcsbClient = rcsbClient;
    private requestStatus: "pending"|"complete" = "complete";
    private rawFeatures: Feature[];
    private annotationFeatures: AnnotationFeatures[];
    private readonly rawFeaturesSubject: Subject<Feature[]> = new Subject<Feature[]>();
    private readonly annotationFeaturesSubject: Subject<AnnotationFeatures[]> = new Subject<AnnotationFeatures[]>();

    public async collect(requestConfig: AnnotationRequestContext): Promise<AnnotationFeatures[]> {
        this.requestStatus = "pending";
        this.annotationFeatures = await this.requestAnnotations(requestConfig);
        if(typeof requestConfig.annotationGenerator === "function") {
            const generatedFeatures: AnnotationFeatures[] = await requestConfig.annotationGenerator(this.annotationFeatures)
            if(generatedFeatures && generatedFeatures.filter((f)=>(f!=null)).length > 0)
                this.annotationFeatures = this.annotationFeatures.concat(generatedFeatures.filter((f)=>(f!=null)));
        }
        if(typeof requestConfig.annotationFilter === "function") {
            this.annotationFeatures = await requestConfig.annotationFilter(this.annotationFeatures);
        }
        if(typeof requestConfig.externalTrackBuilder?.filterFeatures === "function")
            this.annotationFeatures = await requestConfig.externalTrackBuilder.filterFeatures({annotations:this.annotationFeatures, rcsbContext:requestConfig.rcsbContext});
        this.rawFeatures = [].concat.apply([], this.annotationFeatures.map(af=>af.features));
        this.complete();
        return this.annotationFeatures;
    }

    public async getFeatures(): Promise<Feature[]>{
        return new Promise<Feature[]>((resolve, reject)=>{
            if(this.requestStatus === "complete"){
                resolve(this.rawFeatures);
            }else{
                ObservableHelper.oneTimeSubscription<Feature[]>(resolve, this.rawFeaturesSubject);
            }
        });
    }

    public async getAnnotationFeatures(): Promise<AnnotationFeatures[]>{
        return new Promise<AnnotationFeatures[]>((resolve, reject)=>{
            if(this.requestStatus === "complete"){
                resolve(this.annotationFeatures);
            }else{
                ObservableHelper.oneTimeSubscription<AnnotationFeatures[]>(resolve, this.annotationFeaturesSubject);
            }
        })
    }

    private async requestAnnotations(requestConfig: AnnotationRequestContext): Promise<AnnotationFeatures[]> {
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
        this.annotationFeaturesSubject.next(this.annotationFeatures);
        this.rawFeaturesSubject.next(this.rawFeatures);
        console.info("Features Processing Complete");
    }

}

