import {RcsbGroupDisplay} from "./RcsbGroupView/RcsbGroupDisplay";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {entityGranularityGroupFacetStore} from "../RcsbSeacrh/FacetStore/EntityGranularitySearchFacetStore";
import {SearchQueryType} from "../RcsbSeacrh/SearchRequestProperty";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {groupProvenanceToAggregationType} from "../RcsbUtils/GroupProvenanceToAggregationType";

export async function buildSearchRequest(elementId: string, searchQuery:SearchQueryType): Promise<void>{
    await RcsbGroupDisplay.displayRcsbSearchStats(elementId, entityGranularityGroupFacetStore, searchQuery);
}

export async function buildGroup(elementId: string, groupProvenance: GroupProvenanceId, groupId: string, query?:SearchQuery, facetLayoutGrid?:[string,string?][]): Promise<void>{
    await RcsbGroupDisplay.displaySearchAttributes(elementId, groupProvenanceToAggregationType[groupProvenance], groupId, query, facetLayoutGrid);
}

export function buildGroupMembers(elementId: string, groupProvenance: GroupProvenanceId, groupId: string, nRows:number, nColumns:number, query?:SearchQuery): void {
    RcsbGroupDisplay.displayGroupMembers(elementId, groupProvenanceToAggregationType[groupProvenance], groupId, nRows, nColumns, query);
}
