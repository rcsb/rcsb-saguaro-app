import {RcsbFvQuery} from "../../RcsbGraphQL/RcsbFvQuery";
import {
    CorePolymerEntityInstance,
    QueryPolymer_Entity_InstancesArgs
} from "../../RcsbGraphQL/Types/Yosemite/GqlTypes";
import {EntryInstancesCollector, PolymerEntityInstanceInterface} from "./EntryInstancesCollector";


export class MultipleEntityInstancesCollector {

    private rcsbFvQuery: RcsbFvQuery = new RcsbFvQuery();

    public collect(requestConfig: QueryPolymer_Entity_InstancesArgs):  Promise<Array<PolymerEntityInstanceInterface>> {
        return this.rcsbFvQuery.requestMultipleEntityInstances(requestConfig).then(result=>{
            return MultipleEntityInstancesCollector.getEntityInstances(result);
        }).catch(error=>{
            console.log(error);
            throw error;
        });
    }

    private static getEntityInstances(polymer_entity_instances: Array<CorePolymerEntityInstance> ): Array<PolymerEntityInstanceInterface> {
        const out: Array<PolymerEntityInstanceInterface> = new Array<PolymerEntityInstanceInterface>();
        if(polymer_entity_instances instanceof Array){
            polymer_entity_instances.forEach(entity=>{
                if(entity.polymer_entity?.polymer_entity_instances instanceof Array){
                    EntryInstancesCollector.parsePolymerEntityInstances(entity.polymer_entity.polymer_entity_instances, out);
                }
            })
        }
        return out;
    }

}