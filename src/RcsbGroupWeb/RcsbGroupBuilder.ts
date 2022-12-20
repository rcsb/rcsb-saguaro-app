import {RcsbGroupDisplay} from "./RcsbGroupView/RcsbGroupDisplay";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {entityGranularityGroupFacetStore} from "../RcsbSeacrh/FacetStore/EntityGranularitySearchFacetStore";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {GroupChartAdditionalProperties} from "./RcsbGroupView/RcsbGroupChart/GroupChartAdditionalProperties";
import {
    SearchQueryContextManager,
    SearchQueryContextManagerSubjectInterface
} from "./RcsbGroupView/RcsbGroupSeacrhQuery/SearchQueryContextManager";
import {Subscription} from "rxjs";
import {RcsbGroupContentTextInterface} from "./RcsbGroupView/RcsbGroupContent/RcsbGroupContentComponent";
import {ResidueChartInterface} from "./RcsbGroupView/RcsbResidueChart/ResidueChartTools/ResidueChartTools";
import {ChartDisplayConfigInterface} from "@rcsb/rcsb-charts/build/dist/RcsbChartComponent/ChartConfigInterface";

export async function buildSearchRequest(elementId: string, searchQuery:SearchQuery, returnType:ReturnType): Promise<void>{
    await RcsbGroupDisplay.displayRcsbSearchStats(elementId, entityGranularityGroupFacetStore, searchQuery, returnType);
}

export async function buildGroup(elementId: string, groupProvenance: GroupProvenanceId, groupId: string, query?:SearchQuery, facetLayoutGrid?:string[], additionalProperties?: GroupChartAdditionalProperties): Promise<void>{
    await RcsbGroupDisplay.displaySearchAttributes(elementId, groupProvenance, groupId, query, facetLayoutGrid, additionalProperties);
}

export function buildGroupMembers(elementId: string, groupProvenance: GroupProvenanceId, groupId: string, nRows:number, nColumns:number, query?:SearchQuery): void {
    RcsbGroupDisplay.displayGroupMembers(elementId, groupProvenance, groupId, nRows, nColumns, query);
}

export function buildGroupContent(elementId: string, groupProvenance: GroupProvenanceId, groupId: string, query?:SearchQuery, textConfig?:RcsbGroupContentTextInterface): void {
    RcsbGroupDisplay.displayGroupContent(elementId, groupProvenance, groupId, query, textConfig);
}

export function buildResidueDistribution(elementId: string, granularity: ResidueChartInterface["granularity"], rcsbId:string, facetLayoutGrid?:string[], chartDisplayConfig?: Partial<ChartDisplayConfigInterface>): void {
    RcsbGroupDisplay.displayResidueDistribution(elementId,granularity,rcsbId,facetLayoutGrid,chartDisplayConfig);
}

export const searchQueryContextManager = {
    subscribe(f:(o:SearchQueryContextManagerSubjectInterface)=>void): Subscription {
        return SearchQueryContextManager.subscribe(f);
    }
}