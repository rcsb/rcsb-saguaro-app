import {Facet, QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import * as ReactDom from "react-dom";
import {ChartMapType, RcsbChartLayout} from "../../RcsbChartWeb/RcsbChartView/RcsbChartLayout";
import {FacetTools} from "../../RcsbSeacrh/FacetTools";
import React from "react";
import classes from "./RcsbGroupMembers/Components/scss/group-display.module.scss";
import {Container} from "react-bootstrap";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {RcsbGroupMembers} from "./RcsbGroupMembers";
import {FacetStoreInterface} from "../../RcsbSeacrh/FacetStore/FacetStoreInterface";
import {rcsbFvCtxManager} from "../../RcsbFvWeb/RcsbFvBuilder/RcsbFvContextManager";
import {SearchQueryType} from "../../RcsbSeacrh/SearchRequestProperty";
import {
    GroupAggregationUnifiedType,
    groupProvenanceToAggregationType, groupProvenanceToReturnType
} from "../../RcsbUtils/GroupProvenanceToAggregationType";
import { ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {getFacetStoreFromGroupType} from "../../RcsbSeacrh/QueryStore/SearchQueryTools";
import {groupDisplayChart} from "./RcsbGroupDisplay/GroupDisplayChart";


export class RcsbGroupDisplay {

    public static async displayRcsbSearchStats(elementId: string, facetStore: FacetStoreInterface, searchQuery:SearchQueryType, returnType: ReturnType): Promise<void>{
        let facets: Array<Facet> = [];
        for(const service of facetStore.getServices()){
            const groupProperties: QueryResult = await rcsbFvCtxManager.getSearchQueryResult(
                searchQuery,
                facetStore.getFacetService(service).map(f => f.facet),
                facetStore.returnType
            );
            if(groupProperties.drilldown)
                facets = facets.concat(groupProperties.drilldown as Facet[]);
        }
        ReactDom.render(
            <div className={classes.bootstrapGroupComponentScope}>
                <Container fluid={"lg"}>
                    <RcsbChartLayout
                        layout={facetStore.facetLayoutGrid}
                        chartMap={FacetTools.getResultDrilldowns(facetStore.getFacetService("all"), facets).reduce<ChartMapType>((prev,current)=>{
                            return prev.set(current.attribute,{chart: current})
                        },new Map())}
                    />
                </Container>
            </div>,
            document.getElementById(elementId)
        );
    }

    public static async displaySearchAttributes(elementId: string, groupProvenance: GroupProvenanceId, groupId: string, searchQuery?:SearchQuery, facetLayoutGrid?:[string,string?][]): Promise<void>{
        ReactDom.render(
            <div className={classes.bootstrapGroupComponentScope}>
                <Container fluid={"lg"}>
                    <RcsbChartLayout
                        layout={facetLayoutGrid ?? getFacetStoreFromGroupType(groupProvenanceToAggregationType[groupProvenance]).facetLayoutGrid}
                        chartMap={await groupDisplayChart(groupProvenance,groupId,searchQuery)}
                    />
                </Container>
            </div>,
            document.getElementById(elementId)
        );
    }

    static displayGroupMembers(elementId: string, groupProvenance: GroupProvenanceId, groupId: string, nRows: number, nColumns: number, query?:SearchQuery){
        const groupAggregationType: GroupAggregationUnifiedType = groupProvenanceToAggregationType[groupProvenance];
        ReactDom.render(
            <RcsbGroupMembers groupAggregationType={groupAggregationType} groupId={groupId} searchQuery={query} nRows={nRows} nColumns={nColumns}/>,
            document.getElementById(elementId)
        );
    }

}