import {
    RcsbFv,
    RcsbFvBoardConfigInterface,
    RcsbFvRowConfigInterface
} from '@bioinsilico/rcsb-saguaro';

import {SequenceCollector} from "../CollectTools/SequenceCollector";
import {AnnotationCollector} from "../CollectTools/AnnotationCollector";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";



export abstract class RcsbFvCore {

    protected rcsbFv: RcsbFv;
    protected boardConfigData: RcsbFvBoardConfigInterface = {
        length:0
    };
    protected rowConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();

    protected sequenceCollector: SequenceCollector = new SequenceCollector();
    protected annotationCollector: AnnotationCollector = new AnnotationCollector();

    constructor(elementId: string, rcsbFv: RcsbFv) {
        this.rcsbFv = rcsbFv;
    }

    public setPolymerEntityInstance(polymerEntityInstance: PolymerEntityInstanceTranslate){
        this.annotationCollector.setPolymerEntityInstance(polymerEntityInstance);
        this.sequenceCollector.setPolymerEntityInstance(polymerEntityInstance)
    }

    display(): void{
        this.rcsbFv.updateBoardConfig({boardConfigData:this.boardConfigData, rowConfigData:this.rowConfigData});
    }

    getTargets(): Promise<Array<string>>{
        return this.sequenceCollector.getTargets();
    }
}