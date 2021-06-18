import {AlignmentResponse, QueryAlignmentArgs} from "./Types/Borrego/GqlTypes";
import * as query from "./Queries/Borrego/QueryAlignments.graphql";
import {ApolloQueryResult} from "apollo-client";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import ApolloClient from "apollo-boost";
import * as configBorregoGraphQL from "../RcsbServerConfig/codegen.borrego.json";

interface AlignmentResponseInterface{
    alignment: AlignmentResponse;
}

export class RcsbQueryAlignment implements RcsbCoreQueryInterface<QueryAlignmentArgs,AlignmentResponse>{
    readonly client = new ApolloClient({
        uri: (<any>configBorregoGraphQL).schema
    });
    public async request(requestConfig: QueryAlignmentArgs): Promise<AlignmentResponse> {
        try {
            const alignment: ApolloQueryResult<AlignmentResponseInterface> = await this.client.query<AlignmentResponseInterface>({
                query: query,
                variables: {
                    queryId: requestConfig.queryId,
                    from: requestConfig.from,
                    to: requestConfig.to,
                    range: requestConfig.range
                }
            });
            return alignment.data.alignment;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
