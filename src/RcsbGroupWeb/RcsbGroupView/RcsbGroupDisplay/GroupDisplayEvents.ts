import {RcsbChartInterface} from "../../../RcsbSeacrh/FacetTools";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {DateRange, Range, SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {Operator, ReturnType, Service} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {ChartType} from "../../../RcsbChartWeb/RcsbChartView/ChartViewInterface";
import {BarData} from "../../../RcsbChartWeb/RcsbChartView/RcsbChartComponents/BarComponent";
import React from "react";
import {SearchQueryType} from "../../../RcsbSeacrh/SearchRequestProperty";
import {SearchQueryTools as SQT} from "../../../RcsbSeacrh/SearchQueryTools";
import * as resource from "../../../RcsbServerConfig/web.resources.json";
import {ChartMapType} from "../../../RcsbChartWeb/RcsbChartView/RcsbChartLayout";
import {FacetMemberInterface} from "../../../RcsbSeacrh/FacetStore/FacetMemberInterface";
import {GroupDisplayChartMap as GDCM} from "./GroupDisplayChartMap";
import {SearchQueryContextManager as SQCM} from "../RcsbGroupSeacrhQuery/SearchQueryContextManager";

export namespace GroupDisplayEvents {

    export function addBarClickCallback(chart: RcsbChartInterface, groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery:SearchQuery, returnType:ReturnType): void{
        if(!chart.chartConfig)
            chart.chartConfig = {}
        switch (chart.chartType){
            case ChartType.barplot:
                addBarChartClick(chart,groupProvenanceId, groupId,searchQuery,returnType);
                break;
            case ChartType.histogram:
                addHistogramChartClick(chart,groupProvenanceId, groupId,searchQuery,returnType);
                break;
        }
    }

    function addBarChartClick(chart: RcsbChartInterface, groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery:SearchQuery, returnType:ReturnType): void{
        chart.chartConfig.barClickCallback = async (datum:BarData, data: BarData[],e: React.MouseEvent) => {
            let query: SearchQueryType|undefined = undefined;
            if(datum.isLabel){
                query= SQT.searchAttributeQuery(chart.attribute, datum.x, Operator.ExactMatch, Service.Text);
            }else{
                query = SQT.searchAttributeQuery(chart.attribute, data.filter(d=>d.isLabel).map(d=>d.x) as any, Operator.In, Service.Text, true);
            }
            if(chart.filters)
                chart.filters.forEach(f=>{
                    query = SQT.addNewNodeToAttributeSearchQuery(f.attribute, f.value, f.operator, query, f.service)
                })
            await clickEvent(e, chart, groupProvenanceId, groupId, searchQuery, query, returnType);
        };
    }

    function addHistogramChartClick(chart: RcsbChartInterface, groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery:SearchQuery, returnType:ReturnType): void{
        chart.chartConfig.barClickCallback = async (datum:BarData, data: BarData[],e: React.MouseEvent) => {
            const range: Range|DateRange = formatRange(chart, datum);
            const query: SearchQueryType = SQT.addNewNodeToAttributeSearchQuery(chart.attribute, range, Operator.Range, searchQuery.query, Service.Text);
            await clickEvent(e, chart, groupProvenanceId, groupId, searchQuery, query, returnType);
        };
    }

    async function clickEvent(e: React.MouseEvent, chart: RcsbChartInterface, groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery:SearchQuery, query: SearchQueryType, returnType:ReturnType ): Promise<void> {
        if(e.shiftKey) {
            location.href = resource.rcsb_search.url + encodeURI(JSON.stringify(SQT.buildNodeSearchQuery(query, searchQuery.query, returnType)));
        }else{
            const fullQuery = SQT.buildNodeSearchQuery(searchQuery.query, query, returnType);
            const chartMap: ChartMapType = await GDCM.groupDisplayChartMap(groupProvenanceId,groupId,fullQuery);
            SQCM.next({
                chartMap:chartMap,
                attributeName: chart.attributeName,
                searchQuery:fullQuery,
                groupId:groupId,
                groupProvenanceId:groupProvenanceId
            });
        }
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

}