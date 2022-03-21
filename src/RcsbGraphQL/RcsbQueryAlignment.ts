import {
    AlignmentResponse,
    QueryAlignmentArgs,
    QueryGroup_AlignmentArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import queryAlignment from "./Queries/Borrego/QueryAlignments.graphql";
import queryGroupAlignment from "./Queries/Borrego/QueryGroupAlignments.graphql";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/GraphQLRequest";
import {rcsbRequestClient} from "../RcsbRequest/RcsbRequestClient";

interface AlignmentResponseInterface{
    alignment: AlignmentResponse;
}

interface GroupAlignmentResponseInterface{
    group_alignment: AlignmentResponse;
}

export class RcsbQueryAlignment implements RcsbCoreQueryInterface<QueryAlignmentArgs,AlignmentResponse>{
    readonly client: GraphQLRequest = rcsbRequestClient.borrego;
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


export type RcsbQueryGroupAlignmentArguments = QueryGroup_AlignmentArgs & {page:{first:number, after:string}};
export class RcsbQueryGroupAlignment implements RcsbCoreQueryInterface<RcsbQueryGroupAlignmentArguments, AlignmentResponse>{
    readonly client: GraphQLRequest = new GraphQLRequest("borrego");
    public async request(requestConfig: RcsbQueryGroupAlignmentArguments): Promise<AlignmentResponse> {
        try {
            const result: GroupAlignmentResponseInterface = await this.client.request<QueryGroup_AlignmentArgs & {first:number, after:string}, GroupAlignmentResponseInterface>(
                {group: requestConfig.group, groupId: requestConfig.groupId, filter:requestConfig.filter, first: requestConfig.page.first, after: requestConfig.page.after},
                queryGroupAlignment
            );
            return result.group_alignment;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
