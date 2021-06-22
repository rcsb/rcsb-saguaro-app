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
import {RcsbFvModuleBuildInterface, RcsbFvModuleInterface} from "./RcsbFvModuleInterface";
import {Feature} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";



export abstract class RcsbFvAbstractModule implements RcsbFvModuleInterface{

    protected readonly rcsbFv: RcsbFv;
    protected readonly elementId: string;
    protected boardConfigData: RcsbFvBoardConfigInterface = {
        length:0
    };
    protected rowConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();

    protected sequenceCollector: SequenceCollectorInterface = new SequenceCollector();
    protected annotationCollector: AnnotationCollectorInterface = new AnnotationCollector();

    private activeDisplayFlag: boolean = false;

    constructor(elementId: string, rcsbFv: RcsbFv) {
        this.rcsbFv = rcsbFv;
        this.elementId = elementId;
    }

    public setPolymerEntityInstanceTranslator(polymerEntityInstance: PolymerEntityInstanceTranslate){
        this.annotationCollector.setPolymerEntityInstanceTranslator(polymerEntityInstance);
        this.sequenceCollector.setPolymerEntityInstanceTranslator(polymerEntityInstance)
    }

    public async display(): Promise<void>{
        console.log("Starting display");
        await this.rcsbFv.updateBoardConfig({boardConfigData:this.boardConfigData, rowConfigData:this.rowConfigData});
        this.activeDisplayFlag = true;
        return void 0;
    }

    public activeDisplay(): boolean {
        return this.activeDisplayFlag;
    }

    public getFv(): RcsbFv {
        return this.rcsbFv;
    }

    public async getTargets(): Promise<Array<string>>{
        return await this.sequenceCollector.getTargets();
    }

    public async getFeatures(): Promise<Array<Feature>>{
        return await this.annotationCollector.getFeatures();
    }

    public async getAnnotationConfigData(): Promise<Array<RcsbFvRowConfigInterface>>{
        return await this.annotationCollector.getAnnotationConfigData();
    }

    public updateBoardConfig(config: Partial<RcsbFvBoardConfigInterface>): void {
        this.boardConfigData = {...this.boardConfigData, ...config};
    }

    abstract async build(buildConfig: RcsbFvModuleBuildInterface): Promise<void>;
}