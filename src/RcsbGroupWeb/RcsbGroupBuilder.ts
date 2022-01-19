import {RcsbGroupDisplay} from "./RcsbGroupView/RcsbGroupDisplay";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {RcsbFvAdditionalConfig} from "../RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {entityGranularityGroupFacetStore} from "../RcsbSeacrh/FacetStore/EntityGranularitySearchFacetStore";
import {SearchQueryType} from "../RcsbSeacrh/SearchRequestProperty";
import {GroupGranularityType} from "../RcsbSeacrh/QueryStore/SearchGroupQuery";

export async function buildSearchRequest(elementId: string, searchQuery:SearchQueryType): Promise<void>{
    await RcsbGroupDisplay.displayRcsbSearchStats(elementId, entityGranularityGroupFacetStore, searchQuery);
}

export async function buildGroup(elementId: string, groupGranularity: GroupGranularityType, groupId: string, query?:SearchQuery): Promise<void>{
    await RcsbGroupDisplay.displaySearchAttributes(elementId, groupGranularity, query, groupId);
}

export function buildGroupMembers(elementId: string, groupGranularity: GroupGranularityType, groupId: string, nMembers:number, additionalConfig?:RcsbFvAdditionalConfig, query?:SearchQuery): void {
    RcsbGroupDisplay.displayGroupMembers(elementId, groupGranularity, groupId, nMembers, query);
}
