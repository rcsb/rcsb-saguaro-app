import query from "./Queries/Yosemite/QueryMultipleInstanceSequences.graphql";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {
    CorePolymerEntityInstance,
    QueryPolymer_Entity_InstancesArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/GraphQLRequest";

interface InstanceSequencesResult {
    polymer_entity_instances: CorePolymerEntityInstance[];
}
export class RcsbQueryMultipleInstanceSequences  implements RcsbCoreQueryInterface<QueryPolymer_Entity_InstancesArgs, CorePolymerEntityInstance[]> {

    readonly getClient: ()=>GraphQLRequest;
    constructor(getClient:()=>GraphQLRequest){
        this.getClient = getClient;
    }

    async request(requestConfig: QueryPolymer_Entity_InstancesArgs): Promise<CorePolymerEntityInstance[]> {
        try {
            const result: InstanceSequencesResult = await this.getClient().request<QueryPolymer_Entity_InstancesArgs,InstanceSequencesResult>({
                instance_ids: requestConfig.instance_ids
            }, query);
            return result.polymer_entity_instances;
        }catch (error) {
            console.error(error);
            throw new Error(error);
        }
    }


}