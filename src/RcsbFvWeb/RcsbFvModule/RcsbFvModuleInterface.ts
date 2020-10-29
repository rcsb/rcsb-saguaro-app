import {FilterInput, SequenceReference, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";

export interface RcsbFvAdditionalConfig{
    sources?: Array<Source>;
    filters?:Array<FilterInput>;
    hideAlignments?: boolean;
    bottomAlignments?: boolean;
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
    additionalConfig?:RcsbFvAdditionalConfig;
    resolve?:()=>void;

    elementSelectId?: string;
}

export interface RcsbFvModuleInterface {
    display: () => void;
    build: (buildConfig: RcsbFvModuleBuildInterface) => void;
    getTargets: () => Promise<Array<string>>;
    setPolymerEntityInstance: (polymerEntityInstance: PolymerEntityInstanceTranslate)=>void;
}
