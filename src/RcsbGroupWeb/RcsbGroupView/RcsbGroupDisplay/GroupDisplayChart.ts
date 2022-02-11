import {
    GroupAggregationUnifiedType,
    groupProvenanceToAggregationType,
    groupProvenanceToReturnType
} from "../../../RcsbUtils/GroupProvenanceToAggregationType";
import {FacetStoreInterface} from "../../../RcsbSeacrh/FacetStore/FacetStoreInterface";
import {
    addGroupNodeToSearchQuery,
    buildAttributeSearchQuery,
    getFacetStoreFromGroupType,
    searchGroupQuery
} from "../../../RcsbSeacrh/QueryStore/SearchQueryTools";
import {Facet, QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {SearchQueryType} from "../../../RcsbSeacrh/SearchRequestProperty";
import {rcsbFvCtxManager} from "../../../RcsbFvWeb/RcsbFvBuilder/RcsbFvContextManager";
import {FacetTools, RcsbChartInterface} from "../../../RcsbSeacrh/FacetTools";
import {Operator, ReturnType, Service} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {Range, SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import cloneDeep from "lodash/cloneDeep";
import {BarData} from "../../../RcsbChartWeb/RcsbChartTools/EventBar";
import * as resource from "../../../RcsbServerConfig/web.resources.json";
import {ChartMapType} from "../../../RcsbChartWeb/RcsbChartView/RcsbChartLayout";
import {ChartType} from "../../../RcsbChartWeb/RcsbChartView/ChartViewInterface";

export async function groupDisplayChart(groupProvenance: GroupProvenanceId, groupId: string, searchQuery?:SearchQuery): Promise<ChartMapType>{
    const groupAggregationType: GroupAggregationUnifiedType = groupProvenanceToAggregationType[groupProvenance];
    const facetStore: FacetStoreInterface = getFacetStoreFromGroupType(groupAggregationType);
    let facets: Array<Facet> = [];
    for(const service of facetStore.getServices()){
        const groupQuery: SearchQueryType = searchGroupQuery(groupAggregationType, groupId, service);
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
        const searchData: {chartData: Array<RcsbChartInterface>;subData: Array<RcsbChartInterface> | undefined;} = await subtractSearchQuery(chartData, groupAggregationType, groupId, searchQuery);
        chartData = searchData.chartData;
        subData = searchData.subData;
    }
    chartData.forEach((chart=>{
        addBarClickCallback(chart,searchQuery?.query ?? searchGroupQuery(groupAggregationType, groupId, Service.Text),groupProvenanceToReturnType[groupProvenance])
    }));

    return chartData.reduce<ChartMapType>((prev,current)=>{
        return prev.set(current.attribute,{chart: current, subChart: subData?.find((c)=>(c.attribute===current.attribute))})
    },new Map());
}

async function subtractSearchQuery(chartData: Array<RcsbChartInterface>, groupAggregationType: GroupAggregationUnifiedType, groupId: string, searchQuery:SearchQuery): Promise<{chartData: Array<RcsbChartInterface>;subData: Array<RcsbChartInterface> | undefined}>{
    const facetStore: FacetStoreInterface = getFacetStoreFromGroupType(groupAggregationType);
    let subData: Array<RcsbChartInterface> | undefined;
    let partialFacets: Array<Facet> = [];
    for (const service of facetStore.getServices()) {
        const groupQuery: SearchQueryType = addGroupNodeToSearchQuery(groupAggregationType, groupId, searchQuery, service);
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

function addBarClickCallback(chart: RcsbChartInterface, searchQuery:SearchQueryType, returnType:ReturnType): void{
    switch (chart.chartType){
        case ChartType.barplot:
            addBarChartClick(chart,searchQuery,returnType);
            break;
        case ChartType.histogram:
            addHistogramChartClick(chart,searchQuery,returnType);
            break;
    }
}

function addBarChartClick(chart: RcsbChartInterface, searchQuery:SearchQueryType, returnType:ReturnType): void{
    chart.chartConfig.barClickCallback = (datum:BarData, data: BarData[]) => {
        if(datum.isLabel){
            const query: SearchQuery = buildAttributeSearchQuery(chart.attribute, datum.x, Operator.ExactMatch, searchQuery, returnType, Service.Text);
            location.href = resource.rcsb_search.url+encodeURI(JSON.stringify(query));
        }else{
            let query: SearchQuery|undefined = undefined;
            data.filter(d=>d.isLabel).forEach(d=>{
                query = buildAttributeSearchQuery(chart.attribute, d.x, Operator.ExactMatch, query?.query ?? searchQuery, returnType, Service.Text, true);
            })
            location.href = resource.rcsb_search.url+encodeURI(JSON.stringify(query));
        }
    };
}

function addHistogramChartClick(chart: RcsbChartInterface, searchQuery:SearchQueryType, returnType:ReturnType): void{
    chart.chartConfig.barClickCallback = (datum:BarData, data: BarData[]) => {
        const range: Range = {
            from:(datum.x as number)-chart.chartConfig.histogramBinIncrement*0.5,
            to:(datum.x as number)+chart.chartConfig.histogramBinIncrement*0.5,
            include_lower: true,
            include_upper: false
        };
        const query: SearchQuery = buildAttributeSearchQuery(chart.attribute, range, Operator.Range, searchQuery, returnType, Service.Text);
        location.href = resource.rcsb_search.url+encodeURI(JSON.stringify(query));
    };
}
