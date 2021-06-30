import * as query from "./Queries/Yosemite/QueryUniprotEntityGroup.graphql";
import {CoreGroup} from "./Types/Yosemite/GqlTypes";
import {ApolloQueryResult} from "apollo-client";
import ApolloClient from "apollo-boost";
import * as configYosemiteGraphQL from "../RcsbServerConfig/codegen.yosemite.json";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";

interface GroupResultInterface {
    uniprot_entity_group: CoreGroup;
}


export class RcsbQueryUniprotEntityGroup implements RcsbCoreQueryInterface<{group_id: string;},CoreGroup>{
    readonly client = new ApolloClient({
        uri: (<any>configYosemiteGraphQL).schema
    });
    public async request(requestConfig: {group_id: string;}): Promise<CoreGroup> {
        try {
            const response:ApolloQueryResult<GroupResultInterface> = await this.client.query<GroupResultInterface>({
                query: query,
                variables: {
                    groupId: requestConfig.group_id,
                }
            });
            return response.data.uniprot_entity_group;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}