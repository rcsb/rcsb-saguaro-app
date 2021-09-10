import query from "./Queries/Yosemite/QueryGroup.graphql";
import {CoreGroup, QueryGroupArgs} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {GraphQLRequest} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/GraphQLRequest";

interface GroupResultInterface {
    group: CoreGroup;
}

export class RcsbQueryGroup implements RcsbCoreQueryInterface<QueryGroupArgs,CoreGroup>{
    readonly client: GraphQLRequest = new GraphQLRequest("yosemite");
    public async request(requestConfig: QueryGroupArgs): Promise<CoreGroup> {
        try {
            const response:GroupResultInterface = await this.client.request<QueryGroupArgs, GroupResultInterface>(
                {
                    group_id: requestConfig.group_id,
                    aggregation_method: requestConfig.aggregation_method
                },
                query
            );
            return response.group;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}