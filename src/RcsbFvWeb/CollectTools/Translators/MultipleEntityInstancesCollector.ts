import {RcsbClient} from "../../../RcsbGraphQL/RcsbClient";
import {
    CorePolymerEntity,
    QueryPolymer_EntitiesArgs
} from "../../../RcsbGraphQL/Types/Yosemite/GqlTypes";
import {PolymerEntityInstancesCollector, PolymerEntityInstanceInterface} from "./PolymerEntityInstancesCollector";


export class MultipleEntityInstancesCollector {

    private rcsbFvQuery: RcsbClient = new RcsbClient();

    public async collect(requestConfig: QueryPolymer_EntitiesArgs):  Promise<Array<PolymerEntityInstanceInterface>> {
        try{
           const result: Array<CorePolymerEntity> = await this.rcsbFvQuery.requestMultipleEntityInstances(requestConfig);
           return MultipleEntityInstancesCollector.getEntityInstances(result);
        }catch (error) {
            console.log(error);
            throw error;
        }
    }

    private static getEntityInstances(polymer_entities: Array<CorePolymerEntity> ): Array<PolymerEntityInstanceInterface> {
        const out: Array<PolymerEntityInstanceInterface> = new Array<PolymerEntityInstanceInterface>();
        if(polymer_entities instanceof Array){
            polymer_entities.forEach(entity=>{
                if(entity.polymer_entity_instances instanceof Array){
                    PolymerEntityInstancesCollector.parsePolymerEntityInstances(entity.polymer_entity_instances, out);
                }
            })
        }
        return out;
    }

}