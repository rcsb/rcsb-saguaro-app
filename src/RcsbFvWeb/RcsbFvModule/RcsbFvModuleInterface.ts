import {
    Feature,
    FilterInput,
    GroupReference,
    SequenceReference,
    Source
} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/PolymerEntityInstanceTranslate";
import {RcsbFv, RcsbFvBoardConfigInterface, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {PairwiseAlignmentInterface} from "../PairwiseAlignmentTools/PairwiseAlignmentBuilder";
import {AnnotationProcessingInterface} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {SequenceCollectorInterface} from "../../RcsbCollectTools/SequenceCollector/SequenceCollectorInterface";
import {ExternalTrackBuilderInterface} from "../../RcsbCollectTools/FeatureTools/ExternalTrackBuilderInterface";

export interface RcsbFvAdditionalConfig{
    sources?: Array<Source>;
    filters?:Array<FilterInput>;
    batchFilters?:Array<FilterInput>;
    alignmentFilter?:Array<string>;
    hideAlignments?: boolean;
    bottomAlignments?: boolean;
    boardConfig?: Partial<RcsbFvBoardConfigInterface>;
    sequencePrefix?:string;
    annotationProcessing?: AnnotationProcessingInterface;
    sequenceCollector?: SequenceCollectorInterface;
    externalTrackBuilder?: ExternalTrackBuilderInterface;
    page?:{first:number,after:string};
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
    getFeatures(): Promise<Array<Feature>>;
    getAnnotationConfigData(): Promise<Array<RcsbFvRowConfigInterface>>;
    getFv(): RcsbFv;
}
