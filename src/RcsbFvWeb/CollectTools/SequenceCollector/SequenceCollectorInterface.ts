import {CoreCollectorInterface} from "../CoreCollectorInterface";
import {CollectAlignmentInterface, SequenceCollectorDataInterface} from "./SequenceCollector";

export interface SequenceCollectorInterface extends CoreCollectorInterface {
    getTargets():Promise<Array<string>>;
    getSequenceLength(): number;
    collect(requestConfig: CollectAlignmentInterface, entityInstanceMapCollector?: (instanceIds: Array<string>)=>Promise<null>): Promise<SequenceCollectorDataInterface>;
}