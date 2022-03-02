import {PolymerEntityInstanceTranslate} from "../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {RcsbClient} from "../RcsbGraphQL/RcsbClient";
import {ExternalTrackBuilderInterface} from "./FeatureTools/ExternalTrackBuilderInterface";

export interface CoreCollectorInterface {
    readonly rcsbFvQuery: RcsbClient;
    setPolymerEntityInstanceTranslator(p: PolymerEntityInstanceTranslate): void;
    setExternalTrackBuilder(externalTrackBuilder: ExternalTrackBuilderInterface): void;
}