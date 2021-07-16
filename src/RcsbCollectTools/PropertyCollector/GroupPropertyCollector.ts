import {GroupKey, RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {CoreGroup} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Yosemite/GqlTypes";

export interface GroupPropertyInterface{
    groupName: string;
    groupDescription: string;
}

export class GroupPropertyCollector {

    private readonly rcsbFvQuery: RcsbClient = new RcsbClient();

    public async collect(requestConfig: {groupId: string;groupKey: GroupKey;}): Promise<GroupPropertyInterface> {
        try {
            const result: CoreGroup = await this.rcsbFvQuery.requestGroupMembers({group_id: requestConfig.groupId}, requestConfig.groupKey);
            return {
                groupName: result.rcsb_group_info.group_name,
                groupDescription: result.rcsb_group_info.group_description
            };
        }catch (error) {
            console.log(error);
            throw error;
        }
    }

}