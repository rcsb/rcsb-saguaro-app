import {RcsbChartInterface} from "../../../RcsbSeacrh/FacetTools";
import {DateRange, Range} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {Operator, ReturnType, Service} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import React from "react";
import {SearchQueryType} from "../../../RcsbSeacrh/SearchRequestProperty";
import {SearchQueryTools as SQT} from "../../../RcsbSeacrh/SearchQueryTools";
import * as resource from "../../../RcsbServerConfig/web.resources.json";
import {FacetMemberInterface} from "../../../RcsbSeacrh/FacetStore/FacetMemberInterface";
import {SearchQueryContextManager as SQCM} from "../RcsbGroupSeacrhQuery/SearchQueryContextManager";
import {ChartDataInterface} from "@rcsb/rcsb-charts/lib/RcsbChartDataProvider/ChartDataProviderInterface";
import {ChartType} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";
import {ChartTools} from "@rcsb/rcsb-charts/lib/RcsbChartDataProvider/ChartTools";

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
            tooltipText: (d) => {
                const sum = d.values.slice(1).reduce((prev,curr)=>prev+curr,0);
                if(d.index ==  0)
                    return ChartTools.digitGrouping(d.y) + (sum > 0? (" of " + ChartTools.digitGrouping(d.y+sum)) : "") + " group members\n" +
                        "Click to refine group\n" +
                        "Shift-click to search";
            }

        }
    }

    function addBarChartClick(chart: RcsbChartInterface, returnType:ReturnType): void{
        if(chart.chartConfig)
            chart.chartConfig.barClickCallback = async (datum:ChartDataInterface, data: ChartDataInterface[], e: React.MouseEvent) => {
                let query: SearchQueryType = datum.isLabel ?
                    SQT.searchAttributeQuery(chart.attribute, datum.x, Operator.ExactMatch, Service.Text)
                    :
                    SQT.searchAttributeQuery(chart.attribute, data.filter(d=>d.isLabel).map(d=>d.x) as any, Operator.In, Service.Text, true);
                if(chart.filters)
                    chart.filters.forEach(f=>{
                        query = SQT.addNewNodeToAttributeSearchQuery(f.attribute, f.value, f.operator, query, f.service)
                    })
                await clickEvent(e, chart, query, returnType);
            };
    }

    function addHistogramChartClick(chart: RcsbChartInterface, returnType:ReturnType): void{
        if(chart.chartConfig)
            chart.chartConfig.barClickCallback = async (datum:ChartDataInterface, data: ChartDataInterface[], e: React.MouseEvent) => {
                const range: Range|DateRange = formatRange(chart, datum);
                const query: SearchQueryType = SQT.searchAttributeQuery(chart.attribute, range, Operator.Range,  Service.Text);
                await clickEvent(e, chart, query, returnType);
            };
    }

    async function clickEvent(e: React.MouseEvent, chart: RcsbChartInterface, query: SearchQueryType, returnType:ReturnType ): Promise<void> {
        const newQuery = await SQCM.updateSearchQuery(chart.attributeName, query, returnType);
        if(e.shiftKey) {
            location.href = resource.rcsb_search.url + encodeURI(JSON.stringify(newQuery));
        }
    }

    function formatRange(chart: RcsbChartInterface, datum:ChartDataInterface):Range|DateRange {
        switch (chart.contentType) {
            case "date":
                return  {
                    from: formatValue((datum.x as number)-(chart.chartConfig?.histogramBinIncrement ?? 0)*0.5, chart.contentType) as string,
                    to: formatValue((datum.x as number)+(chart.chartConfig?.histogramBinIncrement ?? 0)*0.5, chart.contentType) as string,
                    include_lower: true,
                    include_upper: false
                }
            default:
                return  {
                    from: formatValue((datum.x as number)-(chart.chartConfig?.histogramBinIncrement ?? 0)*0.5, chart.contentType) as number,
                    to: formatValue((datum.x as number)+(chart.chartConfig?.histogramBinIncrement ?? 0)*0.5, chart.contentType) as number,
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