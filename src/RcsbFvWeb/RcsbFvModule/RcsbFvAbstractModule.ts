import {
    RcsbFv,
    RcsbFvBoardConfigInterface,
    RcsbFvRowConfigInterface
} from '@rcsb/rcsb-saguaro';

import {AnnotationCollector} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollector";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {
    AlignmentCollectorInterface,
} from "../../RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface";
import {
    AnnotationRequestContext,
    AnnotationCollectorInterface,
} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {RcsbFvModuleBuildInterface, RcsbFvModuleInterface} from "./RcsbFvModuleInterface";
import {
    AlignmentResponse,
    AnnotationFeatures,
    Feature, TargetAlignment
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {ComponentsManager} from "../RcsbFvComponents/ComponentsManager";
import {ExternalTrackBuilderInterface} from "../../RcsbCollectTools/FeatureTools/ExternalTrackBuilderInterface";
import {PolymerEntityInstanceInterface} from "../../RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";
import {SingletonMap} from "../../RcsbUtils/Helpers/SingletonMap";
import {AlignmentCollector} from "../../RcsbCollectTools/AlignmentCollector/AlignmentCollector";
import {TrackFactoryInterface} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryInterface";
import {
    AlignmentRequestContextType,
    AlignmentTrackFactory
} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory";
import {SequenceTrackFactory} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/SequenceTrackFactory";
import {BlockFactoryInterface} from "../RcsbFvFactories/RcsbFvBlockFactory/BlockFactoryInterface";
import {AlignmentBlockFactory} from "../RcsbFvFactories/RcsbFvBlockFactory/AlignmentBlockFactory";
import {AnnotationsBlockFactory} from "../RcsbFvFactories/RcsbFvBlockFactory/AnnotationsBlockFactory";
import {AnnotationsTrackFactory} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/AnnotationsTrackFactory";
import * as acm from "../../RcsbAnnotationConfig/RcsbAnnotationConfig.ac.json";
import {AnnotationConfigInterface} from "../../RcsbAnnotationConfig/AnnotationConfigInterface";
import {AnnotationBlockManager} from "../RcsbFvFactories/RcsbFvBlockFactory/BlockManager/AnnotationBlockManager";
import {RcsbAnnotationConfig} from "../../RcsbAnnotationConfig/RcsbAnnotationConfig";
import {AnnotationTrackManagerFactory} from "../RcsbFvFactories/RcsbFvBlockFactory/BlockManager/AnnotationTrackManager";
import {TrackManagerInterface} from "../RcsbFvFactories/RcsbFvBlockFactory/BlockManager/TrackManagerInterface";


export abstract class RcsbFvAbstractModule implements RcsbFvModuleInterface{

    protected readonly rcsbFv: RcsbFv;
    protected readonly elementId: string;
    protected boardConfigData: RcsbFvBoardConfigInterface = {
        length:0
    };
    protected rowConfigData: Array<RcsbFvRowConfigInterface> = new Array<RcsbFvRowConfigInterface>();

    protected polymerEntityInstance: PolymerEntityInstanceTranslate;
    protected readonly alignmentCollector: AlignmentCollectorInterface = new AlignmentCollector();
    protected readonly annotationCollector: AnnotationCollectorInterface = new AnnotationCollector();

    protected referenceTrack: RcsbFvRowConfigInterface;
    protected alignmentTracks: Array<RcsbFvRowConfigInterface> = [];
    protected annotationTracks: Array<RcsbFvRowConfigInterface> = [];

    private rcsbFvRowUpdatePromise: Promise<void>;
    private activeDisplayFlag: boolean = false;

    constructor(elementId: string, rcsbFv: RcsbFv) {
        this.rcsbFv = rcsbFv;
        this.elementId = elementId;
        ComponentsManager.buildLoaderSpinner(elementId);
    }

    public setPolymerEntityInstanceTranslator(polymerEntityInstance: PolymerEntityInstanceTranslate){
        this.polymerEntityInstance = polymerEntityInstance;
    }

    public getPolymerEntityInstanceTranslator(){
        return this.polymerEntityInstance;
    }

    public async display(): Promise<void>{
        console.info(`Starting display ${this.elementId}`);
        await this.rcsbFv.updateBoardConfig({
            boardConfigData:{
                rowTitleWidth:190,
                ...this.boardConfigData
            },
            rowConfigData:[]
        });
        ComponentsManager.unmountLoaderSpinner(this.elementId);
        console.info(`Rendering tracks ${this.elementId}`);
        this.rcsbFvRowUpdatePromise = this.rcsbFv.updateBoardConfig({
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
        return await this.alignmentCollector.getTargets();
    }

    public async getAlignmentResponse():Promise<AlignmentResponse> {
        return await this.alignmentCollector.getAlignment();
    }

    public async getFeatures(): Promise<Array<Feature>>{
        //return (await this.annotationCollector.getAnnotationFeatures()).map(af=>af.features).flat();
        return await this.annotationCollector.getFeatures();
    }

    public async getAnnotationConfigData(): Promise<Array<RcsbFvRowConfigInterface>>{
        return this.annotationTracks;
    }

    public async build(buildConfig: RcsbFvModuleBuildInterface): Promise<void>{
        SingletonMap.update(this.elementId, this);
        await this.protectedBuild(buildConfig);
        await this.buildExternalTracks(buildConfig.additionalConfig?.externalTrackBuilder, buildConfig.additionalConfig?.rcsbContext);
        this.concatAlignmentAndAnnotationTracks(buildConfig);
        await this.display();
        return void 0;
    }

    public wait(): Promise<void> {
        return this.rcsbFvRowUpdatePromise;
    }

    protected abstract protectedBuild(buildConfig: RcsbFvModuleBuildInterface): Promise<void>;
    protected abstract concatAlignmentAndAnnotationTracks(buildConfig: RcsbFvModuleBuildInterface): void;

    protected async buildAlignmentTracks(
        alignmentRequestContext: AlignmentRequestContextType,
        alignmentResponse: AlignmentResponse,
        trackFactories?:{
            alignmentTrackFactory?: TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment]>,
            sequenceTrackFactory?: TrackFactoryInterface<[AlignmentRequestContextType, string]>
        }
    ): Promise<void>{
        const sequenceTrackFactory:TrackFactoryInterface<[AlignmentRequestContextType, string]> = trackFactories?.sequenceTrackFactory ?? new SequenceTrackFactory(this.getPolymerEntityInstanceTranslator())
        if(alignmentResponse.query_sequence)
            this.referenceTrack = await sequenceTrackFactory.getTrack(alignmentRequestContext,alignmentResponse.query_sequence);
        const alignmentBlockFactory: BlockFactoryInterface<[AlignmentRequestContextType, AlignmentResponse],[AlignmentRequestContextType, TargetAlignment]> = new AlignmentBlockFactory(
            trackFactories?.alignmentTrackFactory ?? new AlignmentTrackFactory(this.getPolymerEntityInstanceTranslator())
        );
        this.alignmentTracks = await alignmentBlockFactory.getBlock(alignmentRequestContext,alignmentResponse);
    }

    protected async buildAnnotationsTrack(annotationsRequestContext: AnnotationRequestContext, annotationsFeatures: AnnotationFeatures[], annotationConfigMap?: AnnotationConfigInterface): Promise<void> {
        const defaultAnnotationConfigMap: AnnotationConfigInterface = annotationConfigMap ?? acm as unknown as AnnotationConfigInterface;
        const annotationsBlockFactory: BlockFactoryInterface<[AnnotationRequestContext, AnnotationFeatures[]],[TrackManagerInterface]> = new AnnotationsBlockFactory(
            new AnnotationBlockManager(
                new AnnotationTrackManagerFactory(),
                new RcsbAnnotationConfig(defaultAnnotationConfigMap),
                this.getPolymerEntityInstanceTranslator()
            ),
            new AnnotationsTrackFactory()
        );
        this.annotationTracks = await annotationsBlockFactory.getBlock(annotationsRequestContext, annotationsFeatures);
    }

    private async buildExternalTracks(externalTrackBuilder?: ExternalTrackBuilderInterface, rcsbContext?:Partial<PolymerEntityInstanceInterface>): Promise<void> {
        if(!externalTrackBuilder)
            return;
        if(typeof externalTrackBuilder.processAlignmentAndFeatures === "function")
            await externalTrackBuilder.processAlignmentAndFeatures({
                annotations:await this.annotationCollector.getAnnotationFeatures(),
                alignments: await this.alignmentCollector.getAlignment(),
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

}