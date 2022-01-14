import query from "./Queries/Yosemite/QueryGroup.graphql";
import {GroupPolymerEntity, QueryPolymer_Entity_GroupArgs} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/GraphQLRequest";

interface GroupResultInterface {
    group: GroupPolymerEntity;
}

export class RcsbQueryGroup implements RcsbCoreQueryInterface<QueryPolymer_Entity_GroupArgs,GroupPolymerEntity>{
    readonly client: GraphQLRequest = new GraphQLRequest("yosemite");
    public async request(requestConfig: QueryPolymer_Entity_GroupArgs): Promise<GroupPolymerEntity> {
        try {
            const response:GroupResultInterface = await this.client.request<QueryPolymer_Entity_GroupArgs, GroupResultInterface>(
                {
                    group_id: requestConfig.group_id
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