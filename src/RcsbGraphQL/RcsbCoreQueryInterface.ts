import ApolloClient from "apollo-boost";

export interface RcsbCoreQueryInterface<Q,R> {
    readonly client: ApolloClient<any>;
    request(requestConfig: Q): Promise<R>
}