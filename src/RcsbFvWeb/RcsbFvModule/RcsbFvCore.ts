import {
    RcsbFv,
    RcsbFvBoardConfigInterface,
    RcsbFvRowConfigInterface
} from '@rcsb/rcsb-saguaro';

import {SequenceCollector} from "../CollectTools/SequenceCollector";
import {AnnotationCollector} from "../CollectTools/AnnotationCollector";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {Feature} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";



export abstract class RcsbFvCore {

    protected rcsbFv: RcsbFv;
    protected elementId: string;
    protected boardConfigData: RcsbFvBoardConfigInterface = {
        length:0
    };
    protected rowConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();

    protected sequenceCollector: SequenceCollector = new SequenceCollector();
    protected annotationCollector: AnnotationCollector = new AnnotationCollector();

    constructor(elementId: string, rcsbFv: RcsbFv) {
        this.rcsbFv = rcsbFv;
        this.elementId = elementId;
    }

    public setPolymerEntityInstance(polymerEntityInstance: PolymerEntityInstanceTranslate){
        this.annotationCollector.setPolymerEntityInstance(polymerEntityInstance);
        this.sequenceCollector.setPolymerEntityInstance(polymerEntityInstance)
    }

    display(): void{
        console.log("Starting display");
        this.rcsbFv.updateBoardConfig({boardConfigData:this.boardConfigData, rowConfigData:this.rowConfigData});
    }

    public getTargets(): Promise<Array<string>>{
        return this.sequenceCollector.getTargets();
    }

    public getFeatures(): Promise<Array<Feature>>{
        return this.annotationCollector.getFeatures();
    }

    public getAnnotationConfigData(): Promise<Array<RcsbFvRowConfigInterface>>{
        return this.annotationCollector.getAnnotationConfigData();
    }
}