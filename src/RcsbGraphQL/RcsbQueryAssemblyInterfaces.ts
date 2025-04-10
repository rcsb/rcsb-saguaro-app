import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {
    CoreAssembly,
    QueryAssembliesArgs
} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/GraphQLRequest";
import query from "../RcsbQueries/Yosemite/QueryAssemblyInterfaces.graphql";

interface AssemblyInterfacesResultInterface {
    assemblies: Array<CoreAssembly>;
}

export class RcsbQueryAssemblyInterfaces implements RcsbCoreQueryInterface<QueryAssembliesArgs,Array<CoreAssembly>>{
    readonly getClient: ()=>GraphQLRequest;
    constructor(getClient:()=>GraphQLRequest){
        this.getClient = getClient;
    }
    public async request(requestConfig: QueryAssembliesArgs): Promise<Array<CoreAssembly>> {
        try {
            const response:AssemblyInterfacesResultInterface = await this.getClient().request<QueryAssembliesArgs,AssemblyInterfacesResultInterface>(
                requestConfig,
                query
            );
            return response.assemblies;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}