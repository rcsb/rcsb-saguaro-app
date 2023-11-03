import {rcsbClient, RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {
    CorePolymerEntityInstance
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {Assertions} from "../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;
import {MultipleDocumentPropertyCollectorInterface} from "./DataCollectorInterface";

export interface InstanceSequenceInterface {
    rcsbId: string;
    sequence: string;
}

export class MultipleInstanceSequencesCollector implements MultipleDocumentPropertyCollectorInterface<"instance_ids",InstanceSequenceInterface> {

    private readonly rcsbFvQuery: RcsbClient = rcsbClient;
    public async collect(requestConfig: {instance_ids:string[];}): Promise<InstanceSequenceInterface[]> {
        const result: CorePolymerEntityInstance[] = await this.rcsbFvQuery.requestMultipleInstanceSequences(requestConfig)
        return result.map(r=>{
            assertDefined(r.rcsb_id), assertDefined(r.polymer_entity?.entity_poly?.pdbx_seq_one_letter_code_can);
            return {
                rcsbId: r.rcsb_id,
                sequence: r.polymer_entity?.entity_poly?.pdbx_seq_one_letter_code_can
            }
        })
    }

}