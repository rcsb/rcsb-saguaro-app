import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {
    CoreInterface,
    QueryInterfacesArgs
} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/GraphQLRequest";
import query from "../RcsbQueries/Yosemite/QueryInterfaceInstances.graphql";
import {Operator} from "../RcsbUtils/Helpers/Operator";

interface InterfaceInstancesResultInterface {
    interfaces: Array<CoreInterface>;
}

export class RcsbQueryInterfaceInstances implements RcsbCoreQueryInterface<QueryInterfacesArgs,Array<CoreInterface>>{
    private readonly BATCH_SIZE = 1000;
    readonly getClient: ()=>GraphQLRequest;
    constructor(getClient:()=>GraphQLRequest){
        this.getClient = getClient;
    }
    public async request(requestConfig: QueryInterfacesArgs): Promise<Array<CoreInterface>> {
        try {
            const responses: Array<InterfaceInstancesResultInterface> = await Promise.all<InterfaceInstancesResultInterface>(
                Operator.arrayChunk(requestConfig.interface_ids, this.BATCH_SIZE).map(interface_ids=>
                    this.getClient().request<QueryInterfacesArgs,InterfaceInstancesResultInterface>(
                        {...requestConfig, interface_ids},
                        query
                    )
                )
            );
            return responses.flatMap(response=>response.interfaces);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
