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

    constructor(config: RcsbFvBoardConfigInterface) {
        this.rcsbFv = new RcsbFv({
            rowConfigData: null,
            boardConfigData: null,
            elementId: config.elementId
        } as RcsbFvInterface);
        this.boardConfigData = config;
    }

    display(): void{
        this.rcsbFv.setBoardConfig(this.boardConfigData);
        this.rcsbFv.setBoardData(this.rowConfigData);
        this.rcsbFv.init();
    }
}