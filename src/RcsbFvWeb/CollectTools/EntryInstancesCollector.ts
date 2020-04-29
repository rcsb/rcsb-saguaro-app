import {RcsbFvQuery} from "../../RcsbGraphQL/RcsbFvQuery";
import {CoreEntry, QueryEntryArgs} from "../../RcsbGraphQL/Types/Yosemite/GqlTypes";

export interface PolymerEntityInstanceInterface {
    rcsbId: string;
    entryId: string;
    asymId: string;
    authId: string;
}
export class EntitySequenceCollector {

    private rcsbFvQuery: RcsbFvQuery = new RcsbFvQuery();

    public collect(requestConfig: QueryEntryArgs): Promise<Array<PolymerEntityInstanceInterface>> {
        return this.rcsbFvQuery.requestEntityInstances(requestConfig).then(result=>{
            return EntitySequenceCollector.getEntryInstances(result);
        }).catch(error=>{
            console.log(error);
            return error;
        });
    }

    private static getEntryInstances(entry: CoreEntry ): Array<PolymerEntityInstanceInterface>{
        const out: Set<PolymerEntityInstanceInterface> = new Set<PolymerEntityInstanceInterface>();
        if(entry.polymer_entities != null){
            entry.polymer_entities.forEach(entity=>{
                if(entity.polymer_entity_instances!=null){
                    entity.polymer_entity_instances.forEach(instance=>{
                        if(instance.polymer_entity.entity_poly.rcsb_entity_polymer_type == "Protein") {
                            out.add({
                                rcsbId: instance.rcsb_id,
                                entryId: instance.rcsb_polymer_entity_instance_container_identifiers.entry_id,
                                asymId: instance.rcsb_polymer_entity_instance_container_identifiers.asym_id,
                                authId: instance.rcsb_polymer_entity_instance_container_identifiers.auth_asym_id
                            });
                        }
                    })
                }
            })
        }
        return Array.from<PolymerEntityInstanceInterface>(out);
    }

}