import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {CoreEntry, QueryEntriesArgs} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Yosemite/GqlTypes";
import query from "../RcsbQueries/Yosemite/QueryMultipleEntriesProperties.graphql";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/GraphQLRequest";

interface EntryInstancesResultInterface {
    entries: Array<CoreEntry>;
}

export class RcsbQueryMultipleEntriesProperties implements RcsbCoreQueryInterface<QueryEntriesArgs,Array<CoreEntry>>{
    readonly getClient: ()=>GraphQLRequest;
    constructor(getClient:()=>GraphQLRequest){
        this.getClient = getClient;
    }
    public async request(requestConfig: QueryEntriesArgs): Promise<Array<CoreEntry>> {
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