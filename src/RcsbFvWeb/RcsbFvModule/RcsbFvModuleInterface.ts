import {
    AlignmentResponse,
    Feature,
    FilterInput,
    GroupReference,
    SequenceReference,
    Source, TargetAlignment
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {RcsbFv, RcsbFvBoardConfigInterface, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {AnnotationProcessingInterface} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {ExternalTrackBuilderInterface} from "../../RcsbCollectTools/FeatureTools/ExternalTrackBuilderInterface";
import {PairwiseAlignmentInterface} from "../../RcsbUtils/PairwiseAlignmentTools/PairwiseAlignmentBuilder";
import {
    AlignmentRequestContextType
} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory";
import {TrackManagerInterface} from "../RcsbFvFactories/RcsbFvBlockFactory/BlockManager/TrackManagerInterface";

export type RcsbContextType = Partial<{entryId:string;entityId:string;asymId:string;authId:string;upAcc:string;chrId:string;targetId:string;queryId:string;operatorIds:Array<string>;}>;
export interface RcsbFvAdditionalConfig{
    sources?: Array<Source>;
    filters?:Array<FilterInput>;
    alignmentFilter?:Array<string>;
    hideAlignments?: boolean;
    bottomAlignments?: boolean;
    boardConfig?: Partial<RcsbFvBoardConfigInterface>;
    sequencePrefix?:string;
    annotationProcessing?: AnnotationProcessingInterface;
    externalTrackBuilder?: ExternalTrackBuilderInterface;
    page?:{first:number,after:string};
    rcsbContext?:RcsbContextType;
    trackConfigModifier?:{
        alignment?: (alignmentContext: AlignmentRequestContextType, targetAlignment: TargetAlignment) => Promise<Partial<RcsbFvRowConfigInterface>>,
        annotations?: (trackManager: TrackManagerInterface) => Promise<Partial<RcsbFvRowConfigInterface>>
    };
}

//TODO move psa & elementSelectId into additional config
export interface RcsbFvModuleBuildInterface {
    group?: GroupReference;
    groupId?:string;
    queryId?: string;
    from?:SequenceReference;
    to?:SequenceReference;
    sources?:Array<Source>;
    entityId?: string;
    instanceId?: string;
    upAcc?:string;
    refSeqId?:string;
    chrId?:string;
    psa?: PairwiseAlignmentInterface;
    additionalConfig?:RcsbFvAdditionalConfig;
    elementSelectId?: string;
    resolve(module:RcsbFvModulePublicInterface): void;
}

export interface RcsbFvModuleInterface extends RcsbFvModulePublicInterface{
    activeDisplay(): boolean;
    display(): void;
    build(buildConfig: RcsbFvModuleBuildInterface): Promise<void>;
    setPolymerEntityInstanceTranslator(polymerEntityInstance: PolymerEntityInstanceTranslate): void;
    getPolymerEntityInstanceTranslator(): PolymerEntityInstanceTranslate;
}

export interface RcsbFvModulePublicInterface {
    getTargets(): Promise<Array<string>>;
    getAlignmentResponse():Promise<AlignmentResponse>;
    getFeatures(): Promise<Array<Feature>>;
    getAnnotationConfigData(): Promise<Array<RcsbFvRowConfigInterface>>;
    getFv(): RcsbFv;
    wait(): Promise<void>;
}
