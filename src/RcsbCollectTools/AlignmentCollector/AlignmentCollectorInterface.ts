import {
    AlignmentResponse,
    QueryAlignmentArgs, SequenceReference
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import type {RcsbQueryGroupAlignmentArguments} from "../../RcsbGraphQL/RcsbQueryAlignment";
import {ExternalTrackBuilderInterface} from "../FeatureTools/ExternalTrackBuilderInterface";

interface CommonAlignmentInterface {
    externalTrackBuilder?: ExternalTrackBuilderInterface;
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
    from?: SequenceReference;
    to?: SequenceReference;
}

export type AlignmentCollectConfig = Partial<CollectAlignmentInterface & CollectGroupAlignmentInterface>;

export interface AlignmentCollectorInterface {
    getTargets():Promise<string[]>;
    getAlignment():Promise<AlignmentResponse>;
    getAlignmentLength(): Promise<number>;
    collect(requestConfig: AlignmentCollectConfig,
            filter?:string[],
    ): Promise<AlignmentResponse>;
}