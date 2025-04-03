import {rcsbClient, RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {
    CoreAssembly, QueryAssembliesArgs,
} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {Assertions} from "../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;

export interface AssemblyInterfacesInterface {
    rcsbId: string;
    interfaceIds: Array<string>;
}

export class AssemblyInterfacesCollector {

    private readonly rcsbFvQuery: RcsbClient = rcsbClient;
    public async collect(requestConfig: QueryAssembliesArgs): Promise<Array<AssemblyInterfacesInterface>> {
        try {
            const result: Array<CoreAssembly> = await this.rcsbFvQuery.requestAssemblyInterfaces(requestConfig);
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
        interfaceIds: assemblyInterfaces.interfaces?.map(i=>{
            assertDefined(i?.rcsb_id)
            return i.rcsb_id;
        }) ?? []
    }
}