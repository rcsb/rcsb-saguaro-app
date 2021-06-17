import {
    RcsbFv,
    RcsbFvBoardConfigInterface,
    RcsbFvRowConfigInterface
} from '@rcsb/rcsb-saguaro';

import {SequenceCollector} from "../CollectTools/SequenceCollector/SequenceCollector";
import {AnnotationCollector} from "../CollectTools/AnnotationCollector/AnnotationCollector";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {SequenceCollectorInterface} from "../CollectTools/SequenceCollector/SequenceCollectorInterface";
import {AnnotationCollectorInterface} from "../CollectTools/AnnotationCollector/AnnotationCollectorInterface";



export abstract class RcsbFvAbstractModule {

    protected readonly rcsbFv: RcsbFv;
    protected readonly elementId: string;
    protected boardConfigData: RcsbFvBoardConfigInterface = {
        length:0
    };
    protected rowConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();

    protected sequenceCollector: SequenceCollectorInterface = new SequenceCollector();
    protected annotationCollector: AnnotationCollectorInterface = new AnnotationCollector();

    constructor(elementId: string, rcsbFv: RcsbFv) {
        this.rcsbFv = rcsbFv;
        this.elementId = elementId;
    }

    public setPolymerEntityInstanceTranslator(polymerEntityInstance: PolymerEntityInstanceTranslate){
        this.annotationCollector.setPolymerEntityInstanceTranslator(polymerEntityInstance);
        this.sequenceCollector.setPolymerEntityInstanceTranslator(polymerEntityInstance)
    }

    public display(): void{
        console.log("Starting display");
        this.rcsbFv.updateBoardConfig({boardConfigData:this.boardConfigData, rowConfigData:this.rowConfigData});
    }

    public getTargets(): Promise<Array<string>>{
        return this.sequenceCollector.getTargets();
    }

}