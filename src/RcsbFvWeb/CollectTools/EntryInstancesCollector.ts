import {RcsbFvQuery} from "../../RcsbGraphQL/RcsbFvQuery";
import {CoreEntry, QueryEntryArgs} from "../../RcsbGraphQL/Types/Yosemite/GqlTypes";

export interface PolymerEntityInstanceInterface {
    rcsbId: string;
    entityId: string;
    entryId: string;
    asymId: string;
    authId: string;
    authResId: Array<string>;
    names: string;
    taxIds: Array<string>;
}
export class EntryInstancesCollector {

    private rcsbFvQuery: RcsbFvQuery = new RcsbFvQuery();

    public collect(requestConfig: QueryEntryArgs): Promise<Array<PolymerEntityInstanceInterface>> {
        return this.rcsbFvQuery.requestEntityInstances(requestConfig).then(result=>{
            return EntryInstancesCollector.getEntryInstances(result);
        }).catch(error=>{
            console.log(error);
            throw error;
        });
    }

    private static getEntryInstances(entry: CoreEntry ): Array<PolymerEntityInstanceInterface>{
        const out: Set<PolymerEntityInstanceInterface> = new Set<PolymerEntityInstanceInterface>();
        if(entry.polymer_entities != null){
            entry.polymer_entities.forEach(entity=>{
                if(entity.polymer_entity_instances!=null){
                    entity.polymer_entity_instances.forEach(instance=>{
                        if(instance.polymer_entity.entity_poly.rcsb_entity_polymer_type == "Protein") {
                            const name: string = instance.polymer_entity.rcsb_polymer_entity.pdbx_description;
                            const taxIds: Set<string> = new Set<string>();
                            instance.polymer_entity.rcsb_entity_source_organism.forEach(sO=>{
                                taxIds.add(sO.ncbi_scientific_name);
                            });
                            out.add({
                                rcsbId: instance.rcsb_id,
                                entryId: instance.rcsb_polymer_entity_instance_container_identifiers.entry_id,
                                entityId: instance.rcsb_polymer_entity_instance_container_identifiers.entity_id,
                                asymId: instance.rcsb_polymer_entity_instance_container_identifiers.asym_id,
                                authId: instance.rcsb_polymer_entity_instance_container_identifiers.auth_asym_id,
                                authResId: instance.rcsb_polymer_entity_instance_container_identifiers.auth_to_entity_poly_seq_mapping,
                                names: name,
                                taxIds:Array.from(taxIds)
                            });
                        }
                    })
                }
            })
        }
        return Array.from<PolymerEntityInstanceInterface>(out);
    }

}