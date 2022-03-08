import {groupProvenanceToReturnType} from "../../../RcsbUtils/GroupProvenanceToAggregationType";
import {FacetStoreInterface} from "../../../RcsbSeacrh/FacetStore/FacetStoreInterface";
import {
    addGroupNodeToSearchQuery, addNewNodeToAttributeSearchQuery, addNodeToSearchQuery,
    buildAttributeSearchQuery, buildNodeSearchQuery,
    getFacetStoreFromGroupProvenance, searchAttributeQuery,
    searchGroupQuery
} from "../../../RcsbSeacrh/QueryStore/SearchQueryTools";
import {Facet, QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {SearchQueryType} from "../../../RcsbSeacrh/SearchRequestProperty";
import {rcsbFvCtxManager} from "../../../RcsbFvWeb/RcsbFvBuilder/RcsbFvContextManager";
import {FacetTools, RcsbChartInterface} from "../../../RcsbSeacrh/FacetTools";
import {Operator, ReturnType, Service} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {DateRange, Range, SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import cloneDeep from "lodash/cloneDeep";
import {BarData} from "../../../RcsbChartWeb/RcsbChartTools/EventBar";
import * as resource from "../../../RcsbServerConfig/web.resources.json";
import {ChartMapType} from "../../../RcsbChartWeb/RcsbChartView/RcsbChartLayout";
import {ChartType} from "../../../RcsbChartWeb/RcsbChartView/ChartViewInterface";
import {FacetMemberInterface} from "../../../RcsbSeacrh/FacetStore/FacetMemberInterface";

export async function groupDisplayChart(groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery?:SearchQuery): Promise<ChartMapType>{
    const facetStore: FacetStoreInterface = getFacetStoreFromGroupProvenance(groupProvenanceId);
    let facets: Array<Facet> = [];
    for(const service of facetStore.getServices()){
        const groupQuery: SearchQueryType = searchGroupQuery(groupProvenanceId, groupId, service);
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
        const searchData: {chartData: Array<RcsbChartInterface>;subData: Array<RcsbChartInterface> | undefined;} = await subtractSearchQuery(chartData, groupProvenanceId, groupId, searchQuery);
        chartData = searchData.chartData;
        subData = searchData.subData;
    }
    chartData.forEach((chart=>{
        addBarClickCallback(
            chart,
            searchQuery?.query ? addGroupNodeToSearchQuery(groupProvenanceId, groupId, searchQuery.query) : searchGroupQuery(groupProvenanceId, groupId, Service.Text),
            groupProvenanceToReturnType[groupProvenanceId]
        )
    }));

    return chartData.reduce<ChartMapType>((prev,current)=>{
        return prev.set(current.attributeName,{chart: current, subChart: subData?.find((c)=>(c.attributeName===current.attributeName))})
    },new Map());

}

async function subtractSearchQuery(chartData: Array<RcsbChartInterface>, groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery:SearchQuery): Promise<{chartData: Array<RcsbChartInterface>;subData: Array<RcsbChartInterface> | undefined}>{
    const facetStore: FacetStoreInterface = getFacetStoreFromGroupProvenance(groupProvenanceId);
    let subData: Array<RcsbChartInterface> | undefined;
    let partialFacets: Array<Facet> = [];
    for (const service of facetStore.getServices()) {
        const groupQuery: SearchQueryType = addGroupNodeToSearchQuery(groupProvenanceId, groupId, searchQuery.query, service);
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
    if(!chart.chartConfig)
        chart.chartConfig = {}
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
    chart.chartConfig.barClickCallback = (datum:BarData, data: BarData[],e: React.MouseEvent) => {
        let query: SearchQueryType|undefined = undefined;
        if(datum.isLabel){
            query= searchAttributeQuery(chart.attribute, datum.x, Operator.ExactMatch, Service.Text);
        }else{
            query = searchAttributeQuery(chart.attribute, data.filter(d=>d.isLabel).map(d=>d.x) as any, Operator.In, Service.Text, true);
        }
        if(chart.filters)
            chart.filters.forEach(f=>{
                query = addNewNodeToAttributeSearchQuery(f.attribute, f.value, f.operator, query, f.service)
            })
        if(e.shiftKey)
            location.href = resource.rcsb_search.url+encodeURI(JSON.stringify(buildNodeSearchQuery(query,searchQuery,returnType)));
        else
            location.href = location.pathname + "?request="+encodeURI(JSON.stringify(buildNodeSearchQuery(query,searchQuery,returnType)));
    };
}

function addHistogramChartClick(chart: RcsbChartInterface, searchQuery:SearchQueryType, returnType:ReturnType): void{
    chart.chartConfig.barClickCallback = (datum:BarData, data: BarData[],e: React.MouseEvent) => {
        const range: Range|DateRange = formatRange(chart, datum);
        const query: SearchQuery = buildAttributeSearchQuery(chart.attribute, range, Operator.Range, searchQuery, returnType, Service.Text);
        if(e.shiftKey)
            location.href = resource.rcsb_search.url+encodeURI(JSON.stringify(query));
        else
            location.href = location.pathname + "?request="+encodeURI(JSON.stringify(query));
    };
}

function formatRange(chart: RcsbChartInterface, datum:BarData):Range|DateRange {
    switch (chart.contentType) {
        case "date":
            return  {
                from: formatValue((datum.x as number)-chart.chartConfig.histogramBinIncrement*0.5, chart.contentType) as string,
                to: formatValue((datum.x as number)+chart.chartConfig.histogramBinIncrement*0.5, chart.contentType) as string,
                include_lower: true,
                include_upper: false
            }
        default:
            return  {
                from: formatValue((datum.x as number)-chart.chartConfig.histogramBinIncrement*0.5, chart.contentType) as number,
                to: formatValue((datum.x as number)+chart.chartConfig.histogramBinIncrement*0.5, chart.contentType) as number,
                include_lower: true,
                include_upper: false
            }
    }
}

function formatValue(value:string|number,contentType:FacetMemberInterface['contentType']): string|number{
    switch (contentType) {
        case "date":
            return `${value}-01-01`;
        default:
            return value;
    }
}
