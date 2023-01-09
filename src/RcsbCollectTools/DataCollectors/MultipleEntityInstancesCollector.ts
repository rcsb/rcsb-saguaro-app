import {rcsbClient, RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {
    CorePolymerEntity,
    QueryPolymer_EntitiesArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {PolymerEntityInstancesCollector, PolymerEntityInstanceInterface} from "./PolymerEntityInstancesCollector";
import {MultipleDocumentPropertyCollectorInterface} from "./DataCollectorInterface";
import {Assertions} from "../../RcsbUtils/Helpers/Assertions";
import assertElementListDefined = Assertions.assertElementListDefined;

export class MultipleEntityInstancesCollector implements MultipleDocumentPropertyCollectorInterface<"entity_ids",PolymerEntityInstanceInterface>{

    private readonly rcsbFvQuery: RcsbClient = rcsbClient;

    public async collect(requestConfig: QueryPolymer_EntitiesArgs): Promise<Array<PolymerEntityInstanceInterface>> {
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
        polymer_entities?.forEach(entity=>{
            if(Array.isArray(entity.polymer_entity_instances)){
                assertElementListDefined(entity.polymer_entity_instances);
                PolymerEntityInstancesCollector.parsePolymerEntityInstances(entity.polymer_entity_instances, out);
            }
        })
        return out;
    }

}