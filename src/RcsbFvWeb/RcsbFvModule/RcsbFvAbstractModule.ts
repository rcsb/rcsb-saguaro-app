import {
    RcsbFv,
    RcsbFvBoardConfigInterface,
    RcsbFvRowConfigInterface
} from '@rcsb/rcsb-saguaro';

import {
    SequenceCollector,
    SequenceCollectorDataInterface
} from "../../RcsbCollectTools/SequenceCollector/SequenceCollector";
import {AnnotationCollector} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollector";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/PolymerEntityInstanceTranslate";
import {SequenceCollectorInterface} from "../../RcsbCollectTools/SequenceCollector/SequenceCollectorInterface";
import {AnnotationCollectorInterface} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {RcsbFvModuleBuildInterface, RcsbFvModuleInterface} from "./RcsbFvModuleInterface";
import {Feature} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {WebToolsManager} from "../WebTools/WebToolsManager";
import {ExternalTrackBuilderInterface} from "../../RcsbCollectTools/FeatureTools/ExternalTrackBuilderInterface";
import {PolymerEntityInstanceInterface} from "../../RcsbCollectTools/Translators/PolymerEntityInstancesCollector";



export abstract class RcsbFvAbstractModule implements RcsbFvModuleInterface{

    protected readonly rcsbFv: RcsbFv;
    protected readonly elementId: string;
    protected boardConfigData: RcsbFvBoardConfigInterface = {
        length:0
    };
    protected rowConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();

    protected polymerEntityInstance: PolymerEntityInstanceTranslate;
    protected readonly sequenceCollector: SequenceCollectorInterface = new SequenceCollector();
    protected readonly annotationCollector: AnnotationCollectorInterface = new AnnotationCollector();

    protected alignmentTracks: SequenceCollectorDataInterface;
    protected annotationTracks: Array<RcsbFvRowConfigInterface>;

    private activeDisplayFlag: boolean = false;

    constructor(elementId: string, rcsbFv: RcsbFv) {
        this.rcsbFv = rcsbFv;
        this.elementId = elementId;
        WebToolsManager.buildLoaderSpinner(elementId);
    }

    public setPolymerEntityInstanceTranslator(polymerEntityInstance: PolymerEntityInstanceTranslate){
        this.polymerEntityInstance = polymerEntityInstance;
        this.annotationCollector.setPolymerEntityInstanceTranslator(polymerEntityInstance);
        this.sequenceCollector.setPolymerEntityInstanceTranslator(polymerEntityInstance)
    }

    public async display(): Promise<void>{
        console.log("Starting display");
        await this.rcsbFv.updateBoardConfig({
            boardConfigData:{
                rowTitleWidth:190,
                ...this.boardConfigData,
                onFvRenderStartsCallback:()=>{
                    WebToolsManager.unmountLoaderSpinner(this.elementId);
                }
            },
            rowConfigData:this.rowConfigData
        });
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
        //return (await this.annotationCollector.getAnnotationFeatures()).map(af=>af.features).flat();
        return await this.annotationCollector.getFeatures();
    }

    public async getAnnotationConfigData(): Promise<Array<RcsbFvRowConfigInterface>>{
        return await this.annotationCollector.getAnnotationConfigData();
    }

    public updateBoardConfig(config: Partial<RcsbFvBoardConfigInterface>): void {
        this.boardConfigData = {...this.boardConfigData, ...config};
    }

    public async build(buildConfig: RcsbFvModuleBuildInterface): Promise<void>{
        if(buildConfig.additionalConfig?.externalTrackBuilder)
            this.setExternalTrackBuilder(buildConfig.additionalConfig?.externalTrackBuilder);
        await this.protectedBuild(buildConfig);
        if(buildConfig.additionalConfig?.externalTrackBuilder)
            await this.buildExternalTracks(buildConfig.additionalConfig.externalTrackBuilder, buildConfig.additionalConfig?.rcsbContext);
        this.concatAlignmentAndAnnotationTracks(buildConfig);
        await this.display();
        return void 0;
    }

    protected abstract protectedBuild(buildConfig: RcsbFvModuleBuildInterface): Promise<void>;
    protected abstract concatAlignmentAndAnnotationTracks(buildConfig: RcsbFvModuleBuildInterface): void;

    private async buildExternalTracks(externalTrackBuilder: ExternalTrackBuilderInterface, rcsbContext?:Partial<PolymerEntityInstanceInterface>): Promise<void> {
        if(typeof externalTrackBuilder.processAlignmentAndFeatures === "function")
            await externalTrackBuilder.processAlignmentAndFeatures({
                annotations:await this.annotationCollector.getAnnotationFeatures(),
                alignments: await this.sequenceCollector.getAlignmentResponse(),
                rcsbContext: rcsbContext
            });
        if(typeof externalTrackBuilder.addTo === "function")
            await externalTrackBuilder.addTo({
                alignmentTracks: this.alignmentTracks,
                annotationTracks: this.annotationTracks,
                rcsbContext: rcsbContext
            });
        return void 0;
    }

    private setExternalTrackBuilder(externalTrackBuilder: ExternalTrackBuilderInterface): void {
        this.annotationCollector.setExternalTrackBuilder(externalTrackBuilder);
        this.sequenceCollector.setExternalTrackBuilder(externalTrackBuilder);
    }

}