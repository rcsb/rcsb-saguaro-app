import React from "react";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {RcsbGroupMembersComponent} from "./RcsbGroupMembers/RcsbGroupMembersComponent";
import {FacetStoreInterface} from "../../RcsbSeacrh/FacetStore/FacetStoreInterface";
import {SearchQueryType} from "../../RcsbSeacrh/SearchRequestProperty";
import { ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {GroupChartAdditionalProperties} from "./RcsbGroupChart/GroupChartAdditionalProperties";
import {RcsbGroupContentComponent, RcsbGroupContentTextInterface} from "./RcsbGroupContent/RcsbGroupContentComponent";
import {RcsbGroupChartComponent} from "./RcsbGroupChart/RcsbGroupChartComponent";
import {RcsbStatsChartComponent} from "./RcsbGroupChart/RcsbStatsChartComponent";
import {createRoot} from "react-dom/client";
import {ResidueChartInterface} from "./RcsbResidueChart/ResidueChartTools/ResidueChartTools";
import {RcsbResidueChartComponent} from "./RcsbResidueChart/RcsbResidueChartComponent";
import {ChartDisplayConfigInterface} from "../../RcsbChartWeb/RcsbChartComponent/ChartConfigInterface";


export class RcsbGroupDisplay {

    public static async displayRcsbSearchStats(elementId: string, facetStore: FacetStoreInterface, searchQuery:SearchQueryType, returnType: ReturnType): Promise<void>{

        createRoot(document.getElementById(elementId)).render(
            <RcsbStatsChartComponent facetStore={facetStore} searchQuery={searchQuery} returnType={returnType}/>
        );
    }

    public static async displaySearchAttributes(elementId: string, groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery?:SearchQuery, facetLayoutGrid?:string[], additionalProperties?: GroupChartAdditionalProperties): Promise<void>{
        createRoot(document.getElementById(elementId)).render(
            <RcsbGroupChartComponent groupProvenanceId={groupProvenanceId} groupId={groupId} searchQuery={searchQuery} facetLayoutGrid={facetLayoutGrid} additionalProperties={additionalProperties}/>
        );

    }

    static displayGroupMembers(elementId: string, groupProvenanceId: GroupProvenanceId, groupId: string, nRows: number, nColumns: number, query?:SearchQuery): void {
        createRoot(document.getElementById(elementId)).render(
            <RcsbGroupMembersComponent groupProvenanceId={groupProvenanceId} groupId={groupId} searchQuery={query} nRows={nRows} nColumns={nColumns}/>
        );
    }

    static displayGroupContent(elementId: string, groupProvenanceId: GroupProvenanceId, groupId: string, query?:SearchQuery, textConfig?:RcsbGroupContentTextInterface): void {
        createRoot(document.getElementById(elementId)).render(
            <RcsbGroupContentComponent groupProvenanceId={groupProvenanceId} groupId={groupId} searchQuery={query} {...textConfig}/>
        );
    }

    static displayResidueDistribution(elementId: string, granularity: ResidueChartInterface["granularity"], rcsbId:string, facetLayoutGrid?:string[],chartDisplayConfig?: Partial<ChartDisplayConfigInterface>): void {
        createRoot(document.getElementById(elementId)).render(
            <RcsbResidueChartComponent granularity={granularity} rcsbId={rcsbId} facetLayoutGrid={facetLayoutGrid} chartDisplayConfig={chartDisplayConfig}/>
        );
    }
}