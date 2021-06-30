import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {CoreEntry, QueryEntriesArgs} from "./Types/Yosemite/GqlTypes";
import ApolloClient from "apollo-boost";
import * as configYosemiteGraphQL from "../RcsbServerConfig/codegen.yosemite.json";
import {ApolloQueryResult} from "apollo-client";
import * as query from "./Queries/Yosemite/QueryMultipleEntriesProperties.graphql";

interface EntryInstancesResultInterface {
    entries: Array<CoreEntry>;
}

export class RcsbQueryMultipleEntriesProperties implements RcsbCoreQueryInterface<QueryEntriesArgs,Array<CoreEntry>>{
    readonly client = new ApolloClient({
        uri: (<any>configYosemiteGraphQL).schema
    });
    public async request(requestConfig: QueryEntriesArgs): Promise<Array<CoreEntry>> {
        try {
            const response:ApolloQueryResult<EntryInstancesResultInterface> = await this.client.query<EntryInstancesResultInterface>({
                query: query,
                variables: {
                    entryIds: requestConfig.entry_ids,
                }
            });
            return response.data.entries;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}