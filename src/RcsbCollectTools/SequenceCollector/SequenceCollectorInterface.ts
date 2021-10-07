import {CoreCollectorInterface} from "../CoreCollectorInterface";
import {SequenceCollectorDataInterface} from "./SequenceCollector";
import {
    AlignmentResponse,
    QueryAlignmentArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";

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
    getAlignmentResponse():Promise<AlignmentResponse>;
    getSequenceLength(): number;
    collect(requestConfig: CollectAlignmentInterface,
            filter?:Array<string>,
            entityInstanceMapCollector?: (instanceIds: Array<string>)=>Promise<void>,
    ): Promise<SequenceCollectorDataInterface>;
}