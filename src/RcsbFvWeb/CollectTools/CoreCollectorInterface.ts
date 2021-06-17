import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {RcsbFvQuery} from "../../RcsbGraphQL/RcsbFvQuery";

export interface CoreCollectorInterface {
    setPolymerEntityInstanceTranslator(p: PolymerEntityInstanceTranslate): void;
    getPolymerEntityInstanceTranslator(): PolymerEntityInstanceTranslate;
    query(): RcsbFvQuery;
}