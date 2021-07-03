import query from "./Queries/Yosemite/QueryEntryInstances.graphql";
import {CoreEntry, QueryEntryArgs} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {GraphQLRequest} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/GraphQLRequest";

interface EntryInstancesResultInterface {
    entry: CoreEntry;
}

export class RcsbQueryEntryInstances implements RcsbCoreQueryInterface<QueryEntryArgs,CoreEntry>{
    readonly client: GraphQLRequest = new GraphQLRequest("yosemite");
    public async request(requestConfig: QueryEntryArgs): Promise<CoreEntry> {
        try {
            const response:EntryInstancesResultInterface = await this.client.request<QueryEntryArgs,EntryInstancesResultInterface>(
                {
                    entry_id: requestConfig.entry_id,
                },
                query
            );
            return response.entry;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}