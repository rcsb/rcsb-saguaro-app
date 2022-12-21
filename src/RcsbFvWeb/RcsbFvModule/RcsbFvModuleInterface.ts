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
import {ExternalTrackBuilderInterface} from "../../RcsbCollectTools/FeatureTools/ExternalTrackBuilderInterface";
import {PairwiseAlignmentInterface} from "../../RcsbUtils/PairwiseAlignmentTools/PairwiseAlignmentBuilder";
import {
    AnnotationProcessingInterface,
    TrackManagerInterface
} from "../RcsbFvFactories/RcsbFvBlockFactory/AnnotationBlockManager/TrackManagerInterface";
import {UiComponentType} from "../../RcsbFvUI/GroupPfvUI";
import {AlignmentRequestContextType} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryInterface";

export type RcsbContextType = Partial<{entryId:string;entityId:string;asymId:string;authId:string;upAcc:string;chrId:string;targetId:string;queryId:string;operatorIds:string[];}>;
export interface RcsbFvAdditionalConfig{
    sources?: Source[];
    filters?:FilterInput[];
    alignmentFilter?:string[];
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
    externalUiComponents?: UiComponentType<any>[];
}

//TODO move psa & elementSelectId into additional config
export interface RcsbFvModuleBuildInterface {
    group?: GroupReference;
    groupId?:string;
    queryId?: string;
    from?:SequenceReference;
    to?:SequenceReference;
    sources?:Source[];
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
    getTargets(): Promise<string[]>;
    getAlignmentResponse():Promise<AlignmentResponse>;
    getFeatures(): Promise<Feature[]>;
    getAnnotationConfigData(): Promise<RcsbFvRowConfigInterface[]>;
    getFv(): RcsbFv;
    wait(): Promise<void>;
}
