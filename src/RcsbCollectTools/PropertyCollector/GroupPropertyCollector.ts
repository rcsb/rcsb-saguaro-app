import {RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {CoreGroup, QueryGroupArgs} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";

export interface GroupPropertyInterface{
    groupName: string;
    groupDescription: string;
}

export class GroupPropertyCollector {

    private readonly rcsbFvQuery: RcsbClient = new RcsbClient();

    public async collect(requestConfig: QueryGroupArgs): Promise<GroupPropertyInterface> {
        try {
            const result: CoreGroup = await this.rcsbFvQuery.requestGroupInfo(requestConfig);
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