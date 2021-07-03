import query from "./Queries/Yosemite/QueryUniprotEntityGroup.graphql";
import {CoreGroup, QueryUniprot_Entity_GroupArgs} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {GraphQLRequest} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/GraphQLRequest";

interface GroupResultInterface {
    uniprot_entity_group: CoreGroup;
}

export class RcsbQueryUniprotEntityGroup implements RcsbCoreQueryInterface<QueryUniprot_Entity_GroupArgs,CoreGroup>{
    readonly client: GraphQLRequest = new GraphQLRequest("yosemite");
    public async request(requestConfig: QueryUniprot_Entity_GroupArgs): Promise<CoreGroup> {
        try {
            const response:GroupResultInterface = await this.client.request<QueryUniprot_Entity_GroupArgs, GroupResultInterface>(
                {
                    group_id: requestConfig.group_id,
                },
                query
            );
            return response.uniprot_entity_group;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}