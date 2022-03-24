import * as ReactDom from "react-dom";
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


export class RcsbGroupDisplay {

    public static async displayRcsbSearchStats(elementId: string, facetStore: FacetStoreInterface, searchQuery:SearchQueryType, returnType: ReturnType): Promise<void>{

        ReactDom.render(
            <RcsbStatsChartComponent facetStore={facetStore} searchQuery={searchQuery} returnType={returnType}/>,
            document.getElementById(elementId)
        );
    }

    public static async displaySearchAttributes(elementId: string, groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery?:SearchQuery, facetLayoutGrid?:string[], additionalProperties?: GroupChartAdditionalProperties): Promise<void>{
        ReactDom.render(
            <RcsbGroupChartComponent groupProvenanceId={groupProvenanceId} groupId={groupId} searchQuery={searchQuery} facetLayoutGrid={facetLayoutGrid} additionalProperties={additionalProperties}/>,
            document.getElementById(elementId)
        );

    }

    static displayGroupMembers(elementId: string, groupProvenanceId: GroupProvenanceId, groupId: string, nRows: number, nColumns: number, query?:SearchQuery): void {
        ReactDom.render(
            <RcsbGroupMembersComponent groupProvenanceId={groupProvenanceId} groupId={groupId} searchQuery={query} nRows={nRows} nColumns={nColumns}/>,
            document.getElementById(elementId)
        );
    }

    static displayGroupContent(elementId: string, groupProvenanceId: GroupProvenanceId, groupId: string, query?:SearchQuery, textConfig?:RcsbGroupContentTextInterface): void {
        ReactDom.render(
            <RcsbGroupContentComponent groupProvenanceId={groupProvenanceId} groupId={groupId} searchQuery={query} {...textConfig}/>,
            document.getElementById(elementId)
        );
    }
}