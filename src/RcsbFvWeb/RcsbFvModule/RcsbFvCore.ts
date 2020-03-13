import {
    RcsbFv,
    RcsbFvBoardConfigInterface,
    RcsbFvInterface,
    RcsbFvRowConfigInterface
} from 'rcsb-saguaro';

import {SequenceCollector} from "../CollectTools/SequenceCollector";
import {AnnotationCollector} from "../CollectTools/AnnotationCollector";

export abstract class RcsbFvCore {

    rcsbFv: RcsbFv;
    boardConfigData: RcsbFvBoardConfigInterface;
    rowConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();

    sequenceCollector: SequenceCollector = new SequenceCollector();
    annotationCollector: AnnotationCollector = new AnnotationCollector();

    constructor(elementId: string, rcsbFv: RcsbFv) {
        this.rcsbFv = rcsbFv;
        this.boardConfigData = {
            elementId: elementId,
            rowTitleWidth: 190,
            trackWidth: 900,
            length: null
        };
    }

    display(): void{
        this.rcsbFv.setBoardConfig(this.boardConfigData);
        this.rcsbFv.setBoardData(this.rowConfigData);
        this.rcsbFv.init();
    }

    update(): void {
        this.rcsbFv.updateBoardConfig(this.boardConfigData, this.rowConfigData);
    }

    getTargets(): Promise<Array<string>>{
        return this.sequenceCollector.getTargets();
    }
}