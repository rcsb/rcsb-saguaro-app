import {CoreCollectorInterface} from "../CoreCollectorInterface";
import {SequenceCollectorDataInterface} from "./SequenceCollector";
import {
    AlignmentResponse,
    QueryAlignmentArgs,
    QueryGroup_AlignmentArgs
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

export interface CollectGroupAlignmentInterface extends QueryGroup_AlignmentArgs, CommonAlignmentInterface {
    sequencePrefix:string;
}

export type AlignmentCollectConfig = Partial<CollectAlignmentInterface & CollectGroupAlignmentInterface>;

export interface SequenceCollectorInterface extends CoreCollectorInterface {
    getTargets():Promise<Array<string>>;
    getAlignmentResponse():Promise<AlignmentResponse>;
    getSequenceLength(): number;
    collect(requestConfig: CollectAlignmentInterface | CollectGroupAlignmentInterface,
            filter?:Array<string>,
            entityInstanceMapCollector?: (instanceIds: Array<string>)=>Promise<void>,
    ): Promise<SequenceCollectorDataInterface>;
}