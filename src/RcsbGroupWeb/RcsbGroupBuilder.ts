import {RcsbGroupDisplay} from "./RcsbGroupView/RcsbGroupDisplay";
import {SearchQuery} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchQueryInterface";
import {RcsbFvAdditionalConfig} from "../RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {GroupReference} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {entityGroupFacetStore} from "../RcsbSeacrh/FacetStore/EntityGroupFacetStore";
import {entityGranularityGroupFacetStore} from "../RcsbSeacrh/FacetStore/EntityGranularitySearchFacetStore";

export async function buildSearchRequest(elementId: string, searchQuery:SearchQuery): Promise<void>{
    await RcsbGroupDisplay.displaySearchAttributes(elementId, entityGranularityGroupFacetStore, searchQuery);
}

export async function buildGroup(elementId: string, groupType: GroupReference, groupId: string, query?:SearchQuery): Promise<void>{
    await RcsbGroupDisplay.displaySearchAttributes(elementId, entityGroupFacetStore, query, groupId);
}

export function buildGroupMembers(elementId: string, groupId: string, nMembers:number, additionalConfig?:RcsbFvAdditionalConfig, query?:SearchQuery): void {
    RcsbGroupDisplay.displayGroupMembers(elementId, groupId, nMembers, query);
}
