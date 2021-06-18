import * as query from "./Queries/Yosemite/QueryEntryInstances.graphql";
import {CoreEntry, QueryEntryArgs} from "./Types/Yosemite/GqlTypes";
import {ApolloQueryResult} from "apollo-client";
import ApolloClient from "apollo-boost";
import * as configYosemiteGraphQL from "../RcsbServerConfig/codegen.yosemite.json";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";

interface EntryInstancesResultInterface {
    entry: CoreEntry;
}

export class RcsbQueryEntryInstances implements RcsbCoreQueryInterface<QueryEntryArgs,CoreEntry>{
    readonly client = new ApolloClient({
        uri: (<any>configYosemiteGraphQL).schema
    });
    public async request(requestConfig: QueryEntryArgs): Promise<CoreEntry> {
        try {
            const response:ApolloQueryResult<EntryInstancesResultInterface> = await this.client.query<EntryInstancesResultInterface>({
                query: query,
                variables: {
                    queryId: requestConfig.entry_id,
                }
            });
            return response.data.entry;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}