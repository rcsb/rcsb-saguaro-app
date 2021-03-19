import {
    RcsbFvRowConfigInterface,
} from '@rcsb/rcsb-saguaro';

import {CoreCollector} from "./AnnotationCollector/CoreCollector";
import {CollectAnnotationsInterface} from "./AnnotationCollector/AbstractCollector";
import {StandardCollector} from "./AnnotationCollector/StandardCollector";
import {TcgaCollector} from "./AnnotationCollector/TcgaCollector";

export class AnnotationCollector extends CoreCollector{

    public collect(requestConfig: CollectAnnotationsInterface, collectorType?:"standard"|"tcga"): Promise<Array<RcsbFvRowConfigInterface>> {
        if(collectorType === "tcga"){
            const collector: TcgaCollector = new TcgaCollector();
            return collector.collect(requestConfig);
        }else{
            const collector: StandardCollector = new StandardCollector();
            return collector.collect(requestConfig);
        }
    }

}