import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {
    CoreInterface,
    QueryInterfacesArgs
} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/GraphQLRequest";
import query from "../RcsbQueries/Yosemite/QueryInterfaceInstances.graphql";

interface InterfaceInstancesResultInterface {
    interfaces: Array<CoreInterface>;
}

export class RcsbQueryInterfaceInstances implements RcsbCoreQueryInterface<QueryInterfacesArgs,Array<CoreInterface>>{
    readonly getClient: ()=>GraphQLRequest;
    constructor(getClient:()=>GraphQLRequest){
        this.getClient = getClient;
    }
    public async request(requestConfig: QueryInterfacesArgs): Promise<Array<CoreInterface>> {
        try {
            const response:InterfaceInstancesResultInterface = await this.getClient().request<QueryInterfacesArgs,InterfaceInstancesResultInterface>(
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