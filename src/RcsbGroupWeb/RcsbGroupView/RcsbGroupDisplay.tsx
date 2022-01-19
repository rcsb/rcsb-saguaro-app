import {Facet, QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import * as ReactDom from "react-dom";
import {RcsbChartLayout} from "../../RcsbChartWeb/RcsbChartView/RcsbChartLayout";
import {FacetTools, RcsbChartInterface} from "../../RcsbSeacrh/FacetTools";
import React from "react";
import * as classes from "./scss/group-display.module.scss";
import {Container} from "react-bootstrap";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {RcsbGroupMembers} from "./RcsbGroupMembers";
import {FacetStoreInterface} from "../../RcsbSeacrh/FacetStore/FacetStoreInterface";
import {rcsbFvCtxManager} from "../../RcsbFvWeb/RcsbFvBuilder/RcsbFvContextManager";
import {
    addGroupNodeToSearchQuery,
    getFacetStoreFromGroupType, GroupGranularityType,
    searchGroupQuery
} from "../../RcsbSeacrh/QueryStore/SearchGroupQuery";
import {SearchQueryType} from "../../RcsbSeacrh/SearchRequestProperty";
import cloneDeep from 'lodash/cloneDeep';
import {GroupReference} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {entityGroupFacetStore} from "../../RcsbSeacrh/FacetStore/EntityGroupFacetStore";


export class RcsbGroupDisplay {

    public static async displayRcsbSearchStats(elementId: string, facetStore: FacetStoreInterface, searchQuery:SearchQueryType): Promise<void>{
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
                    <RcsbChartLayout layout={facetStore.facetLayoutGrid} charts={FacetTools.getResultDrilldowns(facetStore.getFacetService("all"), facets)}/>
                </Container>
            </div>,
            document.getElementById(elementId)
        );
    }

    public static async displaySearchAttributes(elementId: string, groupGranularity: GroupGranularityType, searchQuery?:SearchQuery, groupId?: string): Promise<void>{
        const facetStore: FacetStoreInterface = getFacetStoreFromGroupType(groupGranularity);
        let facets: Array<Facet> = [];
        for(const service of facetStore.getServices()){
            const groupQuery: SearchQueryType = await searchGroupQuery(groupGranularity, groupId, service);
            const groupProperties: QueryResult | null = await rcsbFvCtxManager.getSearchQueryResult(
                groupQuery,
                facetStore.getFacetService(service).map(f => f.facet),
                facetStore.returnType
            );
            if(groupProperties)
                facets = facets.concat(groupProperties.drilldown as Facet[]);
        }

        let chartData: Array<RcsbChartInterface> = FacetTools.getResultDrilldowns(facetStore.getFacetService("all"), facets);
        let subData: Array<RcsbChartInterface> | undefined = undefined;
        if(searchQuery) {
            const searchData: {chartData: Array<RcsbChartInterface>;subData: Array<RcsbChartInterface> | undefined;} = await subtractSearchQuery(chartData, groupGranularity, groupId, searchQuery);
            chartData = searchData.chartData;
            subData = searchData.subData;
        }

        ReactDom.render(
            <div className={classes.bootstrapGroupComponentScope}>
                <Container fluid={"lg"}>
                    <RcsbChartLayout layout={facetStore.facetLayoutGrid} charts={chartData} subCharts={subData}/>
                </Container>
            </div>,
            document.getElementById(elementId)
        );
    }

    static displayGroupMembers(elementId: string, groupGranularity: GroupGranularityType, groupId: string, nMembers: number, query?:SearchQuery){
        ReactDom.render(
            <RcsbGroupMembers groupGranularity={groupGranularity} groupId={groupId} searchQuery={query} nMembers={nMembers}/>,
            document.getElementById(elementId)
        );
    }

}

async function subtractSearchQuery(chartData: Array<RcsbChartInterface>, groupGranularity: GroupGranularityType, groupId: string, searchQuery:SearchQuery): Promise<{chartData: Array<RcsbChartInterface>;subData: Array<RcsbChartInterface> | undefined}>{
    const facetStore: FacetStoreInterface = getFacetStoreFromGroupType(groupGranularity);
    let subData: Array<RcsbChartInterface> | undefined;
    let partialFacets: Array<Facet> = [];
    for (const service of facetStore.getServices()) {
        const groupQuery: SearchQueryType = await addGroupNodeToSearchQuery(groupGranularity, groupId, searchQuery, service);
        const groupProperties: QueryResult = await rcsbFvCtxManager.getSearchQueryResult(
            groupQuery,
            facetStore.getFacetService(service).map(f => f.facet),
            facetStore.returnType
        );
        if(groupProperties)
            partialFacets = partialFacets.concat(groupProperties.drilldown as Facet[]);
    }
    let partialData: Array<RcsbChartInterface> = cloneDeep(chartData);
    if(partialFacets.length > 0) {
        partialData = FacetTools.getResultDrilldowns(facetStore.getFacetService("all"), partialFacets)
        subData = FacetTools.subtractDrilldowns(
            partialData,
            chartData
        );
    }else{
        subData = cloneDeep(chartData);
        partialData.forEach(chart=>{
            chart.data.forEach(d=>{
                d.population = 0;
            })
        });
    }
    return {chartData: partialData, subData: subData};
}