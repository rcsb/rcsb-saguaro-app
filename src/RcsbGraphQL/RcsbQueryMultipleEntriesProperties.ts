import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {CoreEntry, QueryEntriesArgs} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import query from "./Queries/Yosemite/QueryMultipleEntriesProperties.graphql";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/GraphQLRequest";

interface EntryInstancesResultInterface {
    entries: CoreEntry[];
}

export class RcsbQueryMultipleEntriesProperties implements RcsbCoreQueryInterface<QueryEntriesArgs,CoreEntry[]>{
    readonly getClient: ()=>GraphQLRequest;
    constructor(getClient:()=>GraphQLRequest){
        this.getClient = getClient;
    }
    public async request(requestConfig: QueryEntriesArgs): Promise<CoreEntry[]> {
        try {
            const response:EntryInstancesResultInterface = await this.getClient().request<QueryEntriesArgs, EntryInstancesResultInterface>(
                {
                    entry_ids: requestConfig.entry_ids,
                },
                query
            );
            return response.entries;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}