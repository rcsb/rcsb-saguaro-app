import {GraphQLRequest} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/GraphQLRequest";

export interface RcsbCoreQueryInterface<Q,R> {
    readonly getClient: ()=>GraphQLRequest;
    request(requestConfig: Q): Promise<R>
}