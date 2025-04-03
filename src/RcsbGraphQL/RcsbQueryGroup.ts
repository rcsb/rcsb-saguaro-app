import query from "../RcsbQueries/Yosemite/QueryGroup.graphql";
import {GroupPolymerEntity, QueryPolymer_Entity_GroupArgs} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/GraphQLRequest";

interface GroupResultInterface {
    group: GroupPolymerEntity;
}

export class RcsbQueryGroup implements RcsbCoreQueryInterface<QueryPolymer_Entity_GroupArgs,GroupPolymerEntity>{
    readonly getClient: ()=>GraphQLRequest;
    constructor(getClient:()=>GraphQLRequest){
        this.getClient = getClient;
    }
    public async request(requestConfig: QueryPolymer_Entity_GroupArgs): Promise<GroupPolymerEntity> {
        try {
            const response:GroupResultInterface = await this.getClient().request<QueryPolymer_Entity_GroupArgs, GroupResultInterface>(
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