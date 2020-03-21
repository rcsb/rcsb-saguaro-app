import {RcsbQuery} from "./RcsbQuery";
import * as query from "./Queries/Yosemite/QueryEntryInstances.graphql";
import {CoreEntry, QueryEntryArgs} from "./Types/Yosemite/GqlTypes";

interface EntryInstancesResultInterface {
    entry: CoreEntry;
}

export class RcsbQueryEntryInstances extends RcsbQuery{
    public request(requestConfig: QueryEntryArgs): Promise<CoreEntry>{
        return this.yosemiteClient.query<EntryInstancesResultInterface>({
            query:query,
            variables:{
                queryId:requestConfig.entry_id,
            }
        }).then(result=>{
            return result.data.entry;
        }).catch(error => {
            console.error(error);
            return error;
        });
    }
}