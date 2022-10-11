import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {
    RcsbFvAdditionalConfig,
    RcsbFvModulePublicInterface
} from "../RcsbFvModule/RcsbFvModuleInterface";
import {GroupPfvApp} from "../RcsbFvGroup/GroupTabs/GroupPfvApp";
import {searchRequestProperty} from "../../RcsbSeacrh/SearchRequestProperty";
import {SearchQueryTools as SQT} from "../../RcsbSeacrh/SearchQueryTools";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";

export class RcsbFvGroupAlignmentBuilder {

    static async buildSequenceIdentityAlignmentFv(elementId: string, groupId: string, query?:SearchQuery, additionalConfig?:RcsbFvAdditionalConfig):Promise<RcsbFvModulePublicInterface> {
        let entityCount: number = -1;
        let filterEntities: string[]|undefined = undefined;
        if(query) {
            filterEntities = await searchRequestProperty.requestMembers({
                ...query,
                query: SQT.addGroupNodeToSearchQuery(GroupProvenanceId.ProvenanceSequenceIdentity, groupId, query.query),
                return_type: ReturnType.PolymerEntity
            });
            entityCount = filterEntities.length;
        }else{
            entityCount = await searchRequestProperty.requestCount({query: SQT.searchGroupQuery(GroupProvenanceId.ProvenanceSequenceIdentity, groupId), return_type: ReturnType.PolymerEntity});
        }
        return GroupPfvApp.alignment(elementId, GroupProvenanceId.ProvenanceSequenceIdentity, groupId, entityCount, {
            page:{first:50, after:"0"},
            alignmentFilter: filterEntities,
            ...additionalConfig
        })
    }

}