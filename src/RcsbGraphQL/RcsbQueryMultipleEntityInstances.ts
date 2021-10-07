import query from "./Queries/Yosemite/QueryMultipleEntityInstances.graphql";
import {
    CorePolymerEntity,
    QueryPolymer_EntitiesArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/GraphQLRequest";

interface EntryInstancesResultInterface {
    polymer_entities: Array<CorePolymerEntity>;
}

export class RcsbQueryMultipleEntityInstances implements RcsbCoreQueryInterface<QueryPolymer_EntitiesArgs,Array<CorePolymerEntity>>{
    readonly client: GraphQLRequest = new GraphQLRequest("yosemite");
    public async request(requestConfig: QueryPolymer_EntitiesArgs): Promise<Array<CorePolymerEntity>> {
        try {
            const result:EntryInstancesResultInterface = await this.client.request<QueryPolymer_EntitiesArgs, EntryInstancesResultInterface>(
                {
                    entity_ids: requestConfig.entity_ids,
                },
                query
            );
            return result.polymer_entities;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}