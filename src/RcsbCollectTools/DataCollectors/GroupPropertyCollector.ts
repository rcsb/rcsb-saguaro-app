import {rcsbClient, RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {GroupPolymerEntity, QueryPolymer_Entity_GroupArgs} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";

export interface GroupPropertyInterface{
    groupName: string;
    groupDescription: string;
}

export class GroupPropertyCollector {

    private readonly rcsbFvQuery: RcsbClient = rcsbClient;

    public async collect(requestConfig: QueryPolymer_Entity_GroupArgs): Promise<GroupPropertyInterface> {
        try {
            const result: GroupPolymerEntity = await this.rcsbFvQuery.requestGroupInfo(requestConfig);
            return GroupPropertyCollector.getGroupProperties(result);
        }catch (error) {
            console.log(error);
            throw error;
        }
    }

    private static getGroupProperties(r: GroupPolymerEntity):GroupPropertyInterface{
        return {
            groupName: r.rcsb_group_info.group_name ?? "NA",
            groupDescription: r.rcsb_group_info.group_description ?? "NA"
        };
    }

}