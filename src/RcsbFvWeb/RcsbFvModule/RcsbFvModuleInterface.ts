import {
    AlignmentResponse,
    Feature,
    FilterInput,
    GroupReference,
    SequenceReference,
    Source
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {RcsbFv, RcsbFvBoardConfigInterface, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {PairwiseAlignmentInterface} from "../PairwiseAlignmentTools/PairwiseAlignmentBuilder";
import {AnnotationProcessingInterface} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {SequenceCollectorInterface} from "../../RcsbCollectTools/SequenceCollector/SequenceCollectorInterface";
import {ExternalTrackBuilderInterface} from "../../RcsbCollectTools/FeatureTools/ExternalTrackBuilderInterface";

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
    updateBoardConfig(config: Partial<RcsbFvBoardConfigInterface>): void;
}

export interface RcsbFvModulePublicInterface {
    getTargets(): Promise<Array<string>>;
    getAlignmentResponse():Promise<AlignmentResponse>;
    getFeatures(): Promise<Array<Feature>>;
    getAnnotationConfigData(): Promise<Array<RcsbFvRowConfigInterface>>;
    getFv(): RcsbFv;
}

export interface RcsbFvModuleContainerPublicInterface {
    get(): Promise<RcsbFvModulePublicInterface>;
}
