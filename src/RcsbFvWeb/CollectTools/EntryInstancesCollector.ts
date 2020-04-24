import {RcsbFvQuery} from "../../RcsbGraphQL/RcsbFvQuery";
import {CoreEntry, QueryEntryArgs} from "../../RcsbGraphQL/Types/Yosemite/GqlTypes";

export class EntitySequenceCollector {

    private rcsbFvQuery: RcsbFvQuery = new RcsbFvQuery();

    public collect(requestConfig: QueryEntryArgs): Promise<Array<string>> {
        return this.rcsbFvQuery.requestEntityInstances(requestConfig).then(result=>{
            return EntitySequenceCollector.getEntryInstances(result);
        }).catch(error=>{
            console.log(error);
            return error;
        });
    }

    private static getEntryInstances(entry: CoreEntry ): Array<string>{
        const out: Set<string> = new Set<string>();
        if(entry.polymer_entities != null){
            entry.polymer_entities.forEach(entity=>{
                if(entity.polymer_entity_instances!=null){
                    entity.polymer_entity_instances.forEach(instance=>{
                        if(instance.polymer_entity.entity_poly.rcsb_entity_polymer_type == "Protein") {
                            out.add(instance.rcsb_id);
                        }
                    })
                }
            })
        }
        return Array.from<string>(out);
    }

}