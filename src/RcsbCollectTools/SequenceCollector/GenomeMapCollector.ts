import {RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {CollectAlignmentInterface, SequenceCollectorInterface} from "./SequenceCollectorInterface";
import {SequenceCollectorDataInterface} from "./SequenceCollector";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/PolymerEntityInstanceTranslate";

export class GenomeMapCollector implements SequenceCollectorInterface{

    readonly rcsbFvQuery: RcsbClient = new RcsbClient();

    collect(requestConfig: CollectAlignmentInterface, entityInstanceMapCollector?: (instanceIds: Array<string>) => Promise<null>): Promise<SequenceCollectorDataInterface> {
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


}