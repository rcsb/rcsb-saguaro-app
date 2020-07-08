import {FilterInput, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";

export interface RcsbFvAdditionalConfig{
    sources?: Array<Source>;
    filters?:Array<FilterInput>
}

export interface RcsbFvModuleBuildInterface {
    entityId?: string;
    instanceId?: string;
    upAcc?:string;
    updateFlag: boolean;
    additionalConfig?:RcsbFvAdditionalConfig;
}

export interface RcsbFvModuleInterface {
    display: () => void;
    update: () => void;
    build: (buildConfig: RcsbFvModuleBuildInterface) => void;
    getTargets: () => Promise<Array<string>>;
    setPolymerEntityInstance: (polymerEntityInstance: PolymerEntityInstanceTranslate)=>void;
}
