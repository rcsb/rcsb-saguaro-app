import {RcsbGroupDisplay} from "./RcsbGroupView/RcsbGroupDisplay";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {entityGranularityGroupFacetStore} from "../RcsbSeacrh/FacetStore/EntityGranularitySearchFacetStore";
import {SearchQueryType} from "../RcsbSeacrh/SearchRequestProperty";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {GroupDisplayAdditionalProperties} from "./RcsbGroupView/RcsbGroupDisplay/GroupDisplayAdditionalProperties";

export async function buildSearchRequest(elementId: string, searchQuery:SearchQueryType, returnType:ReturnType): Promise<void>{
    await RcsbGroupDisplay.displayRcsbSearchStats(elementId, entityGranularityGroupFacetStore, searchQuery, returnType);
}

export async function buildGroup(elementId: string, groupProvenance: GroupProvenanceId, groupId: string, query?:SearchQuery, facetLayoutGrid?:[string,string?][], additionalProperties?: GroupDisplayAdditionalProperties): Promise<void>{
    await RcsbGroupDisplay.displaySearchAttributes(elementId, groupProvenance, groupId, query, facetLayoutGrid, additionalProperties);
}

export function buildGroupMembers(elementId: string, groupProvenance: GroupProvenanceId, groupId: string, nRows:number, nColumns:number, query?:SearchQuery): void {
    RcsbGroupDisplay.displayGroupMembers(elementId, groupProvenance, groupId, nRows, nColumns, query);
}
