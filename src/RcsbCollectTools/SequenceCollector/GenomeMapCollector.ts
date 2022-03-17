import {CollectAlignmentInterface, SequenceCollectorInterface} from "./SequenceCollectorInterface";
import {SequenceCollectorDataInterface} from "./SequenceCollector";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {AlignmentResponse} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {ExternalTrackBuilderInterface} from "../FeatureTools/ExternalTrackBuilderInterface";
import {RcsbClient, rcsbClient} from "../../RcsbGraphQL/RcsbClient";

export class GenomeMapCollector implements SequenceCollectorInterface{

    readonly rcsbFvQuery: RcsbClient = rcsbClient;

    collect(requestConfig: CollectAlignmentInterface, filter?:Array<string>, entityInstanceMapCollector?: (instanceIds: Array<string>) => Promise<null>): Promise<SequenceCollectorDataInterface> {
        return Promise.resolve(undefined);
    }

    getPolymerEntityInstanceTranslator(): PolymerEntityInstanceTranslate {
        return undefined;
    }

    getSequenceLength(): number {
        return 0;
    }

    getTargets(): Promise<Array<string>> {
        return Promise.resolve(undefined);
    }

    setPolymerEntityInstanceTranslator(p: PolymerEntityInstanceTranslate): void {
    }

    getAlignmentResponse(): Promise<AlignmentResponse> {
        return Promise.resolve(undefined);
    }

    setExternalTrackBuilder(externalTrackBuilder: ExternalTrackBuilderInterface): void {
    }
}