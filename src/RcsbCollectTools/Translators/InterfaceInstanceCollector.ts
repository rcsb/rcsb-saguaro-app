import {RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {
    CoreInterface,
    QueryInterfacesArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";

export interface InterfaceInstanceInterface {
    rcsbId: string;
    assemblyId: string;
    interfaceId: string;
    asymIds: [string,string];
    operatorIds: [Array<Array<string>>,Array<Array<string>>];
}

export class InterfaceInstanceCollector {
    private readonly rcsbFvQuery: RcsbClient = new RcsbClient();

    public async collect(requestConfig: QueryInterfacesArgs): Promise<Array<InterfaceInstanceInterface>> {
        try {
            const result: Array<CoreInterface> = await this.rcsbFvQuery.requestInterfaceInstances(requestConfig);
            return result.map(r=>parseInterfaceInstances(r));
        }catch (error) {
            console.log(error);
            throw error;
        }
    }
}

function parseInterfaceInstances(coreInterface:CoreInterface): InterfaceInstanceInterface{
    return {
        rcsbId: coreInterface.rcsb_interface_container_identifiers.rcsb_id,
        assemblyId: coreInterface.rcsb_interface_container_identifiers.assembly_id,
        interfaceId: coreInterface.rcsb_interface_container_identifiers.interface_id,
        asymIds: [
            coreInterface.rcsb_interface_partner[0].interface_partner_identifier.asym_id,
            coreInterface.rcsb_interface_partner[1].interface_partner_identifier.asym_id
        ],
        operatorIds: [coreInterface.rcsb_interface_operator[0], coreInterface.rcsb_interface_operator[1]]
    }
}