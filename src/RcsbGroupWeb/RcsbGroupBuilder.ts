import {RcsbGroupDisplay} from "./RcsbGroupView/RcsbGroupDisplay";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {RcsbFvAdditionalConfig} from "../RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {entityGranularityGroupFacetStore} from "../RcsbSeacrh/FacetStore/EntityGranularitySearchFacetStore";
import {SearchQueryType} from "../RcsbSeacrh/SearchRequestProperty";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {groupProvenanceToAggregationType} from "../RcsbUtils/GroupProvenanceToAggregationType";

export async function buildSearchRequest(elementId: string, searchQuery:SearchQueryType): Promise<void>{
    await RcsbGroupDisplay.displayRcsbSearchStats(elementId, entityGranularityGroupFacetStore, searchQuery);
}

export async function buildGroup(elementId: string, groupProvenance: GroupProvenanceId, groupId: string, query?:SearchQuery): Promise<void>{
    await RcsbGroupDisplay.displaySearchAttributes(elementId, groupProvenanceToAggregationType[groupProvenance], query, groupId);
}

export function buildGroupMembers(elementId: string, groupProvenance: GroupProvenanceId, groupId: string, nMembers:number, additionalConfig?:RcsbFvAdditionalConfig, query?:SearchQuery): void {
    RcsbGroupDisplay.displayGroupMembers(elementId, groupProvenanceToAggregationType[groupProvenance], groupId, nMembers, query);
}
