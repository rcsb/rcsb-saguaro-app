import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {
    CoreInterface,
    QueryInterfacesArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/GraphQLRequest";
import query from "./Queries/Yosemite/QueryInterfaceInstances.graphql";
import {rcsbRequestClient} from "../RcsbRequest/RcsbRequestClient";

interface InterfaceInstancesResultInterface {
    interfaces: Array<CoreInterface>;
}

export class RcsbQueryInterfaceInstances implements RcsbCoreQueryInterface<QueryInterfacesArgs,Array<CoreInterface>>{
    readonly client: GraphQLRequest = rcsbRequestClient.yosemite;
    public async request(requestConfig: QueryInterfacesArgs): Promise<Array<CoreInterface>> {
        try {
            const response:InterfaceInstancesResultInterface = await this.client.request<QueryInterfacesArgs,InterfaceInstancesResultInterface>(
                requestConfig,
                query
            );
            return response.interfaces;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}