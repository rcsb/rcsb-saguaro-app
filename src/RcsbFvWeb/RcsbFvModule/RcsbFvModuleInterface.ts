import {FilterInput, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";

export interface RcsbFvAdditionalConfig{
    sources?: Array<Source>;
    filters?:Array<FilterInput>
}

export interface RcsbFvModuleInterface {
    display: () => void;
    update: () => void;
    build: ((queryId: string, updateFlag: boolean, additionalConfig?:RcsbFvAdditionalConfig) => void) | ((query1: string, query2: string, updateFlag: boolean, additionalConfig?:RcsbFvAdditionalConfig) => void);
    getTargets: () => Promise<Array<string>>;
}
