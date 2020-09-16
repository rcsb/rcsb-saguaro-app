import {RcsbQuery} from "./RcsbQuery";
import * as query from "./Queries/Yosemite/QueryMultipleEntityInstances.graphql";
import {QueryPolymer_Entity_InstancesArgs,CorePolymerEntityInstance} from "./Types/Yosemite/GqlTypes";

interface EntryInstancesResultInterface {
    polymer_entity_instances: Array<CorePolymerEntityInstance>;
}

export class RcsbQueryMultipleEntityInstances extends RcsbQuery{
    public request(requestConfig: QueryPolymer_Entity_InstancesArgs): Promise<Array<CorePolymerEntityInstance>>{
        return this.yosemiteClient.query<EntryInstancesResultInterface>({
            query:query,
            variables:{
                instanceIds:requestConfig.instance_ids,
            }
        }).then(result=>{
            return result.data.polymer_entity_instances;
        }).catch(error => {
            console.error(error);
            throw error;
        });
    }
}