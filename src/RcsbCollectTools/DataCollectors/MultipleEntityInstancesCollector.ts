import {rcsbClient, RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {
    CorePolymerEntity,
    QueryPolymer_EntitiesArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {PolymerEntityInstancesCollector, PolymerEntityInstanceInterface} from "./PolymerEntityInstancesCollector";
import {MultipleDocumentPropertyCollectorInterface} from "./DataCollectorInterface";

export class MultipleEntityInstancesCollector implements MultipleDocumentPropertyCollectorInterface<"entity_ids",PolymerEntityInstanceInterface>{

    private readonly rcsbFvQuery: RcsbClient = rcsbClient;

    public async collect(requestConfig: QueryPolymer_EntitiesArgs): Promise<PolymerEntityInstanceInterface[]> {
        try{
           const result: CorePolymerEntity[] = await this.rcsbFvQuery.requestMultipleEntityInstances(requestConfig);
           return MultipleEntityInstancesCollector.getEntityInstances(result);
        }catch (error) {
            console.log(error);
            throw error;
        }
    }

    private static getEntityInstances(polymer_entities: CorePolymerEntity[] ): PolymerEntityInstanceInterface[] {
        const out: PolymerEntityInstanceInterface[] = new Array<PolymerEntityInstanceInterface>();
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