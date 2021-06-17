import {CoreCollectorInterface} from "../CoreCollectorInterface";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {QueryAnnotationsArgs, Source} from "../../../RcsbGraphQL/Types/Borrego/GqlTypes";

export interface CollectAnnotationsInterface extends QueryAnnotationsArgs {
    addTargetInTitle?: Set<Source>;
    collectSwissModel?: boolean;
}

export interface AnnotationCollectorInterface extends CoreCollectorInterface {
    collect(requestConfig: CollectAnnotationsInterface): Promise<Array<RcsbFvRowConfigInterface>>;
}