import {FilterInput, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";

export interface RcsbFvAdditionalConfig{
    sources?: Array<Source>;
    filters?:Array<FilterInput>;
    hideAlignments?: boolean;
}

export interface RcsbFvModuleBuildInterface {
    entityId?: string;
    instanceId?: string;
    upAcc?:string;
    additionalConfig?:RcsbFvAdditionalConfig;
}

export interface RcsbFvModuleInterface {
    display: () => void;
    build: (buildConfig: RcsbFvModuleBuildInterface) => void;
    getTargets: () => Promise<Array<string>>;
    setPolymerEntityInstance: (polymerEntityInstance: PolymerEntityInstanceTranslate)=>void;
}
