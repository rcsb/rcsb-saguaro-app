import {GraphQLRequest} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/GraphQLRequest";

export interface RcsbCoreQueryInterface<Q,R> {
    readonly client: GraphQLRequest;
    request(requestConfig: Q): Promise<R>
}