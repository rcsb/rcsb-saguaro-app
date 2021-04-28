import {Feature, FilterInput, SequenceReference, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {AnnotationContext} from "../Utils/AnnotationContext";
import {RcsbFvBoardConfigInterface, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";

export interface RcsbFvModuleAdditionalConfig{
    sources?: Array<Source>;
    filters?:Array<FilterInput>;
    hideAlignments?: boolean;
    bottomAlignments?: boolean;
    collectorType?: "tcga"|"standard";
    annotationContext?: AnnotationContext;
    boardConfig?: Partial<RcsbFvBoardConfigInterface>;
    annotationUI?: {
        selectId: string;
        panelId: string;
        metadataId: string;
    }
}

export interface RcsbFvModuleBuildInterface {
    queryId?: string;
    from?:SequenceReference;
    to?:SequenceReference;
    sources?:Array<Source>;

    entityId?: string;
    instanceId?: string;
    upAcc?:string;
    refSeqId?:string;
    chrId?:string;
    additionalConfig?:RcsbFvModuleAdditionalConfig;
    resolve?:(rcsbFvModule: RcsbFvModulePublicInterface)=>void;

    elementSelectId?: string;
}

export interface RcsbFvModuleInterface extends RcsbFvModulePublicInterface{
    display: () => void;
    build: (buildConfig: RcsbFvModuleBuildInterface) => void;
    setPolymerEntityInstance: (polymerEntityInstance: PolymerEntityInstanceTranslate)=>void;
    updateBoardConfig: (config: Partial<RcsbFvBoardConfigInterface>) => void;
}

export interface RcsbFvModulePublicInterface {
    getTargets: () => Promise<Array<string>>;
    getFeatures: () => Promise<Array<Feature>>;
    getAnnotationConfigData: () => Promise<Array<RcsbFvRowConfigInterface>>;
}

