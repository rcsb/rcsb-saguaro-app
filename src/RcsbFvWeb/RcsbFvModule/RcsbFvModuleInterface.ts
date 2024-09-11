import {
    RcsbFvBoardConfigInterface,
    RcsbFvRowConfigInterface
} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbFv} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFv";
import {
    SequenceAlignments,
    Features,
    AnnotationFilterInput,
    GroupReference,
    SequenceReference,
    AnnotationReference, TargetAlignments
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {
    AnnotationCollectorInterface,
    AnnotationProcessingInterface, AnnotationsCollectConfig
} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {ExternalTrackBuilderInterface} from "../../RcsbCollectTools/FeatureTools/ExternalTrackBuilderInterface";
import {PairwiseAlignmentInterface} from "../../RcsbUtils/PairwiseAlignmentTools/PairwiseAlignmentBuilder";
import {
    AlignmentRequestContextType
} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory";
import {TrackManagerInterface} from "../RcsbFvFactories/RcsbFvBlockFactory/BlockManager/TrackManagerInterface";
import {UiComponentType} from "../../RcsbFvUI/GroupPfvUI";
import {TrackFactoryInterface} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryInterface";
import {
    AlignmentCollectConfig,
    AlignmentCollectorInterface
} from "../../RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface";


export type RcsbContextType = Partial<{entryId:string;entityId:string;asymId:string;authId:string;upAcc:string;chrId:string;targetId:string;queryId:string;operatorIds:Array<string>;}>;
export interface RcsbFvAdditionalConfig{
    sources?: Array<AnnotationReference>;
    filters?:Array<AnnotationFilterInput>;
    alignmentFilter?:Array<string>;
    hideAlignments?: boolean;
    bottomAlignments?: boolean;
    boardConfig?: Partial<RcsbFvBoardConfigInterface>;
    sequencePrefix?:string;
    annotationProcessing?: AnnotationProcessingInterface;
    externalTrackBuilder?: ExternalTrackBuilderInterface;
    page?:{first:number,after:number};
    excludeLogo?: boolean;
    rcsbContext?:RcsbContextType;
    trackConfigModifier?:{
        alignment?: (alignmentContext: AlignmentRequestContextType, targetAlignment: TargetAlignments, alignmentResponse: SequenceAlignments, alignmentIndex: number) => Promise<Partial<RcsbFvRowConfigInterface>>,
        annotations?: (trackManager: TrackManagerInterface) => Promise<Partial<RcsbFvRowConfigInterface>>
    };
    externalUiComponents?: {
        add?: UiComponentType<any>[];
        replace?: UiComponentType<any>[];
    };
    dataProvider?: RcsbModuleDataProviderInterface;
}

export interface RcsbModuleDataProviderInterface {
    alignments?: {
        collector: AlignmentCollectorInterface;
        context: AlignmentCollectConfig;
        trackFactories?:{
            alignmentTrackFactory?: TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignments]>,
            sequenceTrackFactory?: TrackFactoryInterface<[AlignmentRequestContextType, string]>
        }
    };
    annotations?: {
        collector: AnnotationCollectorInterface;
        context: AnnotationsCollectConfig;
    };
}

//TODO move psa & elementSelectId into additional config
export interface RcsbFvModuleBuildInterface {
    group?: GroupReference;
    groupId?:string;
    queryId?: string;
    from?:SequenceReference;
    to?:SequenceReference;
    sources?:Array<AnnotationReference>;
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

export interface RcsbFvModulePublicInterface<
    P extends {[k:string]:any;} = {},
    S extends {[k:string]:any;} = {},
    R extends {[k:string]:any;} = {},
    M extends {[k:string]:any;} = {}
> {
    getTargets(): Promise<Array<string>>;
    getAlignmentResponse():Promise<SequenceAlignments>;
    getFeatures(): Promise<Array<Features>>;
    getAnnotationConfigData(): Promise<Array<RcsbFvRowConfigInterface<P,S,R,M>>>;
    getFv(): RcsbFv<P,S,R,M>;
    wait(): Promise<void>;
}
