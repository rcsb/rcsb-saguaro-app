import {
    AlignmentResponse,
    QueryAlignmentArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbQueryGroupAlignmentArguments} from "../../RcsbGraphQL/RcsbQueryAlignment";

interface CommonAlignmentInterface {
    filterByTargetContains?:string;
    dynamicDisplay?: boolean;
    excludeAlignmentLinks?: boolean;
    fitTitleWidth?:boolean;
    excludeFirstRowLink?:boolean;
}

export interface CollectAlignmentInterface extends QueryAlignmentArgs, CommonAlignmentInterface {

}

export interface CollectGroupAlignmentInterface extends RcsbQueryGroupAlignmentArguments, CommonAlignmentInterface {
    sequencePrefix:string;
}

export type AlignmentCollectConfig = Partial<CollectAlignmentInterface & CollectGroupAlignmentInterface>;

export interface AlignmentCollectorInterface {
    getTargets():Promise<Array<string>>;
    getAlignment():Promise<AlignmentResponse>;
    getAlignmentLength(): Promise<number>;
    collect(requestConfig: CollectAlignmentInterface | CollectGroupAlignmentInterface,
            filter?:Array<string>,
    ): Promise<AlignmentResponse>;
}