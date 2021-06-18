import {RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {
    CorePolymerEntity,
    QueryPolymer_EntitiesArgs
} from "../../RcsbGraphQL/Types/Yosemite/GqlTypes";
import {EntryInstancesCollector, PolymerEntityInstanceInterface} from "./EntryInstancesCollector";


export class MultipleEntityInstancesCollector {

    private rcsbFvQuery: RcsbClient = new RcsbClient();

    public collect(requestConfig: QueryPolymer_EntitiesArgs):  Promise<Array<PolymerEntityInstanceInterface>> {
        return this.rcsbFvQuery.requestMultipleEntityInstances(requestConfig).then(result=>{
            return MultipleEntityInstancesCollector.getEntityInstances(result);
        }).catch(error=>{
            console.log(error);
            throw error;
        });
    }

    private static getEntityInstances(polymer_entities: Array<CorePolymerEntity> ): Array<PolymerEntityInstanceInterface> {
        const out: Array<PolymerEntityInstanceInterface> = new Array<PolymerEntityInstanceInterface>();
        if(polymer_entities instanceof Array){
            polymer_entities.forEach(entity=>{
                if(entity.polymer_entity_instances instanceof Array){
                    EntryInstancesCollector.parsePolymerEntityInstances(entity.polymer_entity_instances, out);
                }
            })
        }
        return out;
    }

}