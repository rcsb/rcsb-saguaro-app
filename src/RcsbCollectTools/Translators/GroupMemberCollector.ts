import {GroupKey, RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {CoreGroup} from "../../RcsbGraphQL/Types/Yosemite/GqlTypes";
import {PolymerEntityInstanceInterface} from "./PolymerEntityInstancesCollector";
import {MultipleEntityInstancesCollector} from "./MultipleEntityInstancesCollector";

export class GroupMemberCollector {

    private readonly rcsbFvQuery: RcsbClient = new RcsbClient();

    public async collect(requestConfig: {groupId: string;groupKey: GroupKey;}): Promise<Array<PolymerEntityInstanceInterface>> {
        try {
            const result: CoreGroup = await this.rcsbFvQuery.requestGroupMembers({group_id: requestConfig.groupId}, requestConfig.groupKey);
            if(result.rcsb_group_info.group_members_granularity === "polymer_entity"){
                const multipleEntityInstancesCollector: MultipleEntityInstancesCollector = new MultipleEntityInstancesCollector();
                return  await multipleEntityInstancesCollector.collect({entity_ids: result.rcsb_group_container_identifiers.group_member_ids});
            }else{
                console.error(`Group granularity ${result.rcsb_group_info.group_members_granularity} not supported`);
                throw `Group granularity ${result.rcsb_group_info.group_members_granularity} not supported`;
            }
        }catch (error) {
            console.log(error);
            throw error;
        }
    }

}