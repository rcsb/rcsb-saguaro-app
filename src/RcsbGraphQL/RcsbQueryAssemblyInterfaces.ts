import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {
    CoreAssembly,
    QueryAssembliesArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/GraphQLRequest";
import query from "./Queries/Yosemite/QueryAssemblyInterfaces.graphql";

interface AssemblyInterfacesResultInterface {
    assemblies: CoreAssembly[];
}

export class RcsbQueryAssemblyInterfaces implements RcsbCoreQueryInterface<QueryAssembliesArgs,CoreAssembly[]>{
    readonly getClient: ()=>GraphQLRequest;
    constructor(getClient:()=>GraphQLRequest){
        this.getClient = getClient;
    }
    public async request(requestConfig: QueryAssembliesArgs): Promise<CoreAssembly[]> {
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