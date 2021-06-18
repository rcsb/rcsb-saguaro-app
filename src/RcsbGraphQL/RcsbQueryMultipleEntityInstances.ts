import * as query from "./Queries/Yosemite/QueryMultipleEntityInstances.graphql";
import {
    CorePolymerEntity,
    QueryPolymer_EntitiesArgs
} from "./Types/Yosemite/GqlTypes";
import {ApolloQueryResult} from "apollo-client";
import ApolloClient from "apollo-boost";
import * as configYosemiteGraphQL from "../RcsbServerConfig/codegen.yosemite.json";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";

interface EntryInstancesResultInterface {
    polymer_entities: Array<CorePolymerEntity>;
}

export class RcsbQueryMultipleEntityInstances implements RcsbCoreQueryInterface<QueryPolymer_EntitiesArgs,Array<CorePolymerEntity>>{
    readonly client = new ApolloClient({
        uri: (<any>configYosemiteGraphQL).schema
    });
    public async request(requestConfig: QueryPolymer_EntitiesArgs): Promise<Array<CorePolymerEntity>> {
        try {
            const result:ApolloQueryResult<EntryInstancesResultInterface> = await this.client.query<EntryInstancesResultInterface>({
                query: query,
                variables: {
                    entityIds: requestConfig.entity_ids,
                }
            });
            return result.data.polymer_entities;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}