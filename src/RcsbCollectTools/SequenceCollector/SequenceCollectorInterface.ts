import {CoreCollectorInterface} from "../CoreCollectorInterface";
import {SequenceCollectorDataInterface} from "./SequenceCollector";
import {
    QueryAlignmentArgs,
} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";

interface CommonAlignmentInterface {
    filterByTargetContains?:string;
    dynamicDisplay?: boolean;
    excludeAlignmentLinks?: boolean;
    fitTitleWidth?:boolean;
    excludeFirstRowLink?:boolean;
}

export interface CollectAlignmentInterface extends QueryAlignmentArgs, CommonAlignmentInterface {

}

export type AlignmentCollectConfig = Partial<CollectAlignmentInterface>;

export interface SequenceCollectorInterface extends CoreCollectorInterface {
    getTargets():Promise<Array<string>>;
    getSequenceLength(): number;
    collect(requestConfig: CollectAlignmentInterface, entityInstanceMapCollector?: (instanceIds: Array<string>)=>Promise<void>): Promise<SequenceCollectorDataInterface>;
}