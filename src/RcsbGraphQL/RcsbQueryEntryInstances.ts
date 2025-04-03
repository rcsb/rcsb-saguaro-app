import query from "../RcsbQueries/Yosemite/QueryEntryInstances.graphql";
import {CoreEntry, QueryEntryArgs} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/GraphQLRequest";

interface EntryInstancesResultInterface {
    entry: CoreEntry;
}

export class RcsbQueryEntryInstances implements RcsbCoreQueryInterface<QueryEntryArgs,CoreEntry>{
    readonly getClient: ()=>GraphQLRequest;
    constructor(getClient:()=>GraphQLRequest){
        this.getClient = getClient;
    }
    public async request(requestConfig: QueryEntryArgs): Promise<CoreEntry> {
        try {
            const response:EntryInstancesResultInterface = await this.getClient().request<QueryEntryArgs,EntryInstancesResultInterface>(
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