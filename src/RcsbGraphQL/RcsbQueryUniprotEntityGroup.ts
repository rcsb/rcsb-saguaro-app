import * as query from "./Queries/Yosemite/QueryUniprotEntityGroup.graphql";
import {CoreGroup,  QueryUniprot_Entity_GroupArgs} from "./Types/Yosemite/GqlTypes";
import {ApolloQueryResult} from "apollo-client";
import ApolloClient from "apollo-boost";
import * as configYosemiteGraphQL from "../RcsbServerConfig/codegen.yosemite.json";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";

interface GroupResultInterface {
    group: CoreGroup;
}

export class RcsbQueryUniprotEntityGroup implements RcsbCoreQueryInterface<QueryUniprot_Entity_GroupArgs,CoreGroup>{
    readonly client = new ApolloClient({
        uri: (<any>configYosemiteGraphQL).schema
    });
    public async request(requestConfig: QueryUniprot_Entity_GroupArgs): Promise<CoreGroup> {
        try {
            const response:ApolloQueryResult<GroupResultInterface> = await this.client.query<GroupResultInterface>({
                query: query,
                variables: {
                    groupId: requestConfig.group_id,
                }
            });
            return response.data.group;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}