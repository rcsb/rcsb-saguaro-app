import {rcsbClient, RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {
    CoreAssembly, QueryAssembliesArgs,
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";

export interface AssemblyInterfacesInterface {
    rcsbId: string;
    interfaceIds: string[];
}

export class AssemblyInterfacesCollector {

    private readonly rcsbFvQuery: RcsbClient = rcsbClient;
    public async collect(requestConfig: QueryAssembliesArgs): Promise<AssemblyInterfacesInterface[]> {
        try {
            const result: CoreAssembly[] = await this.rcsbFvQuery.requestAssemblyInterfaces(requestConfig);
            return result.map(r=>parseAssemblyInterfaces(r));
        }catch (error) {
            console.log(error);
            throw error;
        }
    }
}

function parseAssemblyInterfaces(assemblyInterfaces: CoreAssembly): AssemblyInterfacesInterface{
    return {
        rcsbId: assemblyInterfaces.rcsb_id,
        interfaceIds: assemblyInterfaces.interfaces.map(i=>i.rcsb_id)
    }
}