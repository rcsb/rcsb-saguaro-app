import {PolymerEntityInstanceTranslate} from "../RcsbUtils/PolymerEntityInstanceTranslate";
import {RcsbClient} from "../RcsbGraphQL/RcsbClient";

export interface CoreCollectorInterface {
    readonly rcsbFvQuery: RcsbClient;
    setPolymerEntityInstanceTranslator(p: PolymerEntityInstanceTranslate): void;
    getPolymerEntityInstanceTranslator(): PolymerEntityInstanceTranslate;
}