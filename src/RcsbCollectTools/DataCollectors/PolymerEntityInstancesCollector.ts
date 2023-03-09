import {rcsbClient, RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {
    CoreEntry,
    CorePolymerEntityInstance,
    QueryEntryArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {StructureDeterminationMethodology} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";

export interface PolymerEntityInstanceInterface {
    rcsbId: string;
    entityId: string;
    entryId: string;
    asymId: string;
    authId: string;
    authResId: Array<string>;
    name: string;
    taxNames: Array<string>;
    experimentalMethod: string;
    resolution: number;
    sequenceLength: number;
    entityMolecularWeight: number;
    entryMolecularWeight: number;
    structureDeterminationMethodology: StructureDeterminationMethodology;
}

export class PolymerEntityInstancesCollector {

    private readonly rcsbFvQuery: RcsbClient = rcsbClient;

    public async collect(requestConfig: QueryEntryArgs): Promise<Array<PolymerEntityInstanceInterface>> {
        try {
            const result: CoreEntry = await this.rcsbFvQuery.requestEntityInstances(requestConfig);
            return PolymerEntityInstancesCollector.getEntryInstances(result);
        }catch (error) {
            console.log(error);
            throw error;
        }
    }

    private static getEntryInstances(entry: CoreEntry ): Array<PolymerEntityInstanceInterface>{
        const out: Array<PolymerEntityInstanceInterface> = new Array<PolymerEntityInstanceInterface>();
        if(entry?.polymer_entities instanceof Array){
            entry.polymer_entities.forEach(entity=>{
                if(entity.polymer_entity_instances instanceof Array){
                    PolymerEntityInstancesCollector.parsePolymerEntityInstances(entity.polymer_entity_instances, out);
                }
            })
        }
        return out;
    }

    static parsePolymerEntityInstances(polymerEntityInstances: Array<CorePolymerEntityInstance>, out: Array<PolymerEntityInstanceInterface>){
        polymerEntityInstances.forEach(instance=>{
            const taxIds: Set<string> = new Set<string>();
            if(instance?.polymer_entity?.rcsb_entity_source_organism instanceof Array)
                instance.polymer_entity.rcsb_entity_source_organism.forEach(sO=>{
                    if(typeof sO.ncbi_scientific_name === "string" && sO.ncbi_scientific_name.length > 0)
                        taxIds.add(sO.ncbi_scientific_name);
                });
            out.push({
                rcsbId: instance.rcsb_id,
                entryId: instance.rcsb_polymer_entity_instance_container_identifiers.entry_id,
                entityId: instance.rcsb_polymer_entity_instance_container_identifiers.entity_id,
                asymId: instance.rcsb_polymer_entity_instance_container_identifiers.asym_id,
                authId: instance.rcsb_polymer_entity_instance_container_identifiers.auth_asym_id,
                authResId: instance.rcsb_polymer_entity_instance_container_identifiers.auth_to_entity_poly_seq_mapping,
                name: instance.polymer_entity.rcsb_polymer_entity.rcsb_polymer_name_combined?.names?.join(", ") ?? instance.polymer_entity.rcsb_polymer_entity.pdbx_description,
                taxNames:Array.from(taxIds),
                experimentalMethod: instance.polymer_entity.entry.rcsb_entry_info.experimental_method,
                resolution: instance.polymer_entity.entry.rcsb_entry_info.resolution_combined ? instance.polymer_entity.entry.rcsb_entry_info.resolution_combined[0] : undefined,
                sequenceLength: instance.polymer_entity.entity_poly.rcsb_sample_sequence_length,
                entityMolecularWeight: instance.polymer_entity.rcsb_polymer_entity.formula_weight,
                entryMolecularWeight: instance.polymer_entity.entry.rcsb_entry_info.molecular_weight,
                structureDeterminationMethodology: instance.polymer_entity.entry.rcsb_entry_info.structure_determination_methodology as StructureDeterminationMethodology
            });
        });
    }

}