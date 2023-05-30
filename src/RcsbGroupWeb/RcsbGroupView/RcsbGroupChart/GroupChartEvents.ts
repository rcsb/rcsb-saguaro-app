import {RcsbChartInterface} from "../../../RcsbSeacrh/FacetTools";
import {DateRange, Range} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {Operator, ReturnType, Service} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import React from "react";
import {SearchQueryTools as SQT} from "../../../RcsbSeacrh/SearchQueryTools";
import * as resource from "../../../RcsbServerConfig/web.resources.json";
import {FacetMemberInterface} from "../../../RcsbSeacrh/FacetStore/FacetMemberInterface";
import {SearchQueryContextManager as SQCM} from "../RcsbGroupSeacrhQuery/SearchQueryContextManager";
import {ChartType} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";
import {ChartTools} from "@rcsb/rcsb-charts/lib/RcsbChartDataProvider/ChartTools";
import {SearchQueryType} from "@rcsb/rcsb-search-tools/lib/SearchQueryTools/SearchQueryInterfaces";
import {
    ChartDataColumnInterface,
    ChartDataValueInterface
} from "@rcsb/rcsb-charts/lib/RcsbChartDataProvider/ChartDataProviderInterface";
import {GroupChartMap} from "./GroupChartTools";

export namespace GroupChartEvents {

    export function addBarClickCallback(chart: RcsbChartInterface, returnType:ReturnType): void{
        if(!chart.chartConfig)
            chart.chartConfig = {}
        switch (chart.chartType){
            case ChartType.barplot:
                addBarChartClick(chart,returnType);
                break;
            case ChartType.histogram:
                addHistogramChartClick(chart,returnType);
                break;
        }
    }

    export function addTooltipText(chart: RcsbChartInterface): void {
        chart.chartConfig = {
            ...chart.chartConfig,
            tooltipText: (d: ChartDataValueInterface<GroupChartMap.ChartObjectIdType>) => {
                const sum = d.values.slice(1).reduce((prev,curr)=>prev+curr.value,0);
                if(d.id ==  "included")
                    return ChartTools.digitGrouping(d.y) + (sum > 0? (" of " + ChartTools.digitGrouping(d.y+sum)) : "") + " group members\n" +
                        "Click to refine group\n" +
                        "Shift-click to search";
            }

        }
    }

    function addBarChartClick(chart: RcsbChartInterface, returnType:ReturnType): void{
        if(chart.chartConfig)
            chart.chartConfig.barClickCallback = async (datum:ChartDataValueInterface<GroupChartMap.ChartObjectIdType>, data: ChartDataColumnInterface[], e?: React.MouseEvent) => {
                if(datum.id === "excluded")
                    return;
                let query: SearchQueryType = SQT.searchAttributeQuery(chart.attribute, datum.x, Operator.ExactMatch, Service.Text);
                if(chart.filters)
                    chart.filters.forEach(f=>{
                        query = SQT.addNewNodeToAttributeSearchQuery(f.attribute, f.value, f.operator, query, f.service)
                    })
                await clickEvent(e ?? {shiftKey: false}, chart, query, returnType);
            };
    }

    function addHistogramChartClick(chart: RcsbChartInterface, returnType:ReturnType): void{
        if(chart.chartConfig)
            chart.chartConfig.barClickCallback = async (datum:ChartDataValueInterface, data: ChartDataColumnInterface[], e?: React.MouseEvent) => {
                if(datum.id === "excluded")
                    return;
                const range: Range|DateRange = formatRange(chart, datum);
                const query: SearchQueryType = SQT.searchAttributeQuery(chart.attribute, range, Operator.Range,  Service.Text);
                await clickEvent(e ?? {shiftKey: false}, chart, query, returnType);
            };
    }

    async function clickEvent(e: {shiftKey: boolean;}, chart: RcsbChartInterface, query: SearchQueryType, returnType:ReturnType ): Promise<void> {
        const newQuery = await SQCM.updateSearchQuery(chart.attributeName, query, returnType);
        if(e.shiftKey) {
            location.href = resource.rcsb_search.url + encodeURI(JSON.stringify(newQuery));
        }
    }

    function formatRange(chart: RcsbChartInterface, datum:ChartDataValueInterface):Range|DateRange {
        switch (chart.contentType) {
            case "date":
                return  {
                    from: formatValue((parseFloat(datum.x.toString()))-(chart.chartConfig?.histogramBinIncrement ?? 0)*0.5, chart.contentType) as string,
                    to: formatValue((parseFloat(datum.x.toString()))+(chart.chartConfig?.histogramBinIncrement ?? 0)*0.5, chart.contentType) as string,
                    include_lower: true,
                    include_upper: false
                }
            default:
                return  {
                    from: formatValue((parseFloat(datum.x.toString()))-(chart.chartConfig?.histogramBinIncrement ?? 0)*0.5, chart.contentType) as number,
                    to: formatValue((parseFloat(datum.x.toString()))+(chart.chartConfig?.histogramBinIncrement ?? 0)*0.5, chart.contentType) as number,
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