import {rcsbClient, RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {GroupPolymerEntity, QueryPolymer_Entity_GroupArgs} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {PolymerEntityInstanceInterface} from "./PolymerEntityInstancesCollector";
import {MultipleEntityInstancesCollector} from "./MultipleEntityInstancesCollector";

export class GroupMemberCollector {

    private readonly rcsbFvQuery: RcsbClient = rcsbClient;

    public async collect(requestConfig: QueryPolymer_Entity_GroupArgs): Promise<Array<PolymerEntityInstanceInterface>> {
        const result: GroupPolymerEntity = await this.rcsbFvQuery.requestGroupInfo(requestConfig);
        if(result.rcsb_group_info.group_members_granularity === "polymer_entity"){
            const multipleEntityInstancesCollector: MultipleEntityInstancesCollector = new MultipleEntityInstancesCollector();
            return  await multipleEntityInstancesCollector.collect({entity_ids: result.rcsb_group_container_identifiers.group_member_ids.filter((x): x is string => x!=null)});
        }else{
            console.error(`Group granularity ${result.rcsb_group_info.group_members_granularity} not supported`);
            throw new Error(`Group granularity ${result.rcsb_group_info.group_members_granularity} not supported`);
        }
    }

}