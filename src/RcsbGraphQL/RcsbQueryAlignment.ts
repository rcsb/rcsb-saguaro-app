import {
    AlignmentResponse,
    QueryAlignmentArgs,
    QueryGroup_AlignmentArgs
} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import queryAlignment from "./Queries/Borrego/QueryAlignments.graphql";
import queryGroupAlignment from "./Queries/Borrego/QueryGroupAlignments.graphql";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {GraphQLRequest} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/GraphQLRequest";

interface AlignmentResponseInterface{
    alignment: AlignmentResponse;
}

interface GroupAlignmentResponseInterface{
    group_alignment: AlignmentResponse;
}


export class RcsbQueryAlignment implements RcsbCoreQueryInterface<QueryAlignmentArgs,AlignmentResponse>{
    readonly client: GraphQLRequest = new GraphQLRequest("borrego");
    public async request(requestConfig: QueryAlignmentArgs): Promise<AlignmentResponse> {
        try {
            const result: AlignmentResponseInterface = await this.client.request<QueryAlignmentArgs,AlignmentResponseInterface>({
                    queryId: requestConfig.queryId,
                    from: requestConfig.from,
                    to: requestConfig.to,
                    range: requestConfig.range
                },
                queryAlignment
            );
            return result.alignment;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}


export class RcsbQueryGroupAlignment implements RcsbCoreQueryInterface<QueryGroup_AlignmentArgs, AlignmentResponse>{
    readonly client: GraphQLRequest = new GraphQLRequest("borrego");
    public async request(requestConfig: QueryGroup_AlignmentArgs): Promise<AlignmentResponse> {
        try {
            const result: GroupAlignmentResponseInterface = await this.client.request<QueryGroup_AlignmentArgs,GroupAlignmentResponseInterface>({
                    group: requestConfig.group,
                    groupId: requestConfig.groupId
                },
                queryGroupAlignment
            );
            return result.group_alignment;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
