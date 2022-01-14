import {RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {GroupPolymerEntity, QueryPolymer_Entity_GroupArgs} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";

export interface GroupPropertyInterface{
    groupName: string;
    groupDescription: string;
}

export class GroupPropertyCollector {

    private readonly rcsbFvQuery: RcsbClient = new RcsbClient();

    public async collect(requestConfig: QueryPolymer_Entity_GroupArgs): Promise<GroupPropertyInterface> {
        try {
            const result: GroupPolymerEntity = await this.rcsbFvQuery.requestGroupInfo(requestConfig);
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