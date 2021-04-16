import {
    RcsbFvRowConfigInterface,
} from '@rcsb/rcsb-saguaro';

import {CoreCollector} from "./CoreCollector/CoreCollector";
import {CollectAnnotationsInterface} from "./AnnotationCollector/AbstractAnnotationCollector";
import {StandardAnnotationCollector} from "./AnnotationCollector/StandardAnnotationCollector";
import {TcgaAnnotationCollector} from "./AnnotationCollector/TcgaAnnotationCollector";
import {Feature} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";

export class AnnotationCollector extends CoreCollector{

    private featureList: Array<Feature> = new Array<Feature>();
    private featuresReadyFlag: boolean = false;
    private annotationsConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();

    public collect(requestConfig: CollectAnnotationsInterface): Promise<Array<RcsbFvRowConfigInterface>> {
        const collector: TcgaAnnotationCollector|StandardAnnotationCollector = requestConfig.collectorType === "tcga" ? new TcgaAnnotationCollector() : new StandardAnnotationCollector();
        collector.setPolymerEntityInstance(this.getPolymerEntityInstance());
        return collector.collect(requestConfig).then((annResult)=>{
            this.featureList = collector.getFeatures();
            this.annotationsConfigData = collector.getAnnotationConfigData();
            this.featuresReadyFlag = true;
            return annResult;
        });
    }

    public getFeatures(): Promise<Array<Feature>>{
        return new Promise<Array<Feature>>((resolve, reject)=>{
            const recursive = ()=>{
                if(this.featuresReadyFlag){
                    resolve(this.featureList);
                }else{
                    setTimeout(()=>{
                        recursive();
                    },300);
                }
            };
            recursive();
        })
    }

    public getAnnotationConfigData(): Promise<Array<RcsbFvRowConfigInterface>>{
        return new Promise<Array<RcsbFvRowConfigInterface>>((resolve, reject)=>{
            const recursive = ()=>{
                if(this.featuresReadyFlag){
                    resolve(this.annotationsConfigData);
                }else{
                    setTimeout(()=>{
                        recursive();
                    },300);
                }
            };
            recursive();
        })
    }

}