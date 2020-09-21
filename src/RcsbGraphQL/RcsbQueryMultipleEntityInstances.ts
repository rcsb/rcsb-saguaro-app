import {RcsbQuery} from "./RcsbQuery";
import * as query from "./Queries/Yosemite/QueryMultipleEntityInstances.graphql";
import {
    CorePolymerEntity,
    CorePolymerEntityInstance,
    QueryPolymer_EntitiesArgs
} from "./Types/Yosemite/GqlTypes";

interface EntryInstancesResultInterface {
    polymer_entities: Array<CorePolymerEntity>;
}

export class RcsbQueryMultipleEntityInstances extends RcsbQuery{
    public request(requestConfig: QueryPolymer_EntitiesArgs): Promise<Array<CorePolymerEntity>>{
        return this.yosemiteClient.query<EntryInstancesResultInterface>({
            query:query,
            variables:{
                entityIds:requestConfig.entity_ids,
            }
        }).then(result=>{
            return result.data.polymer_entities;
        }).catch(error => {
            console.error(error);
            throw error;
        });
    }
}