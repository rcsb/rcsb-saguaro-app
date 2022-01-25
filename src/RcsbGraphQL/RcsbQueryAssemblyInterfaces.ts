import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {
    CoreAssembly,
    QueryAssembliesArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/GraphQLRequest";
import query from "./Queries/Yosemite/QueryAssemblyInterfaces.graphql";

interface AssemblyInterfacesResultInterface {
    assemblies: Array<CoreAssembly>;
}

export class RcsbQueryAssemblyInterfaces implements RcsbCoreQueryInterface<QueryAssembliesArgs,Array<CoreAssembly>>{
    readonly client: GraphQLRequest = new GraphQLRequest("yosemite");
    public async request(requestConfig: QueryAssembliesArgs): Promise<Array<CoreAssembly>> {
        try {
            const response:AssemblyInterfacesResultInterface = await this.client.request<QueryAssembliesArgs,AssemblyInterfacesResultInterface>(
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