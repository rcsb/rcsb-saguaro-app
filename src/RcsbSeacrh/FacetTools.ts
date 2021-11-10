import {Facet} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {ChartConfigInterface, ChartType} from "../RcsbChartWeb/RcsbChartView/ChartViewInterface";
import {FacetMemberInterface} from "./FacetStore/FacetMemberInterface";
import cloneDeep from 'lodash/cloneDeep';

export interface RcsbChartDataInterface {
    label: string|number;
    population: number;
}

export interface RcsbChartInterface {
    chartType: ChartType;
    labelList?: string[];
    attribute: string;
    chartConfig?: ChartConfigInterface,
    title: string,
    data: RcsbChartDataInterface[];
}


export class FacetTools {

    public static getResultDrilldowns(facetMembers: FacetMemberInterface[], facets: Array<Facet>, labelList?:string[], recursiveOut?: Array<RcsbChartInterface>): Array<RcsbChartInterface>{
        const out: Array<RcsbChartInterface> = new Array<RcsbChartInterface>();
        facets.forEach(f=> {
            if(f.groups.filter(g=>g.drilldown).length > 0){
                f.groups.filter(g=>g.drilldown).forEach(g=>{
                    FacetTools.getResultDrilldowns(facetMembers, g.drilldown as Facet[], labelList ? labelList.concat(g.label) : [g.label], out);
                });
            }
            if(f.groups.filter(g=>!g.drilldown).length > 0) {
                const chart: {chartType: ChartType; chartConfig?: ChartConfigInterface; title: string;} = FacetTools.getFacetChartTypeByAttribute(facetMembers, f.attribute);
                out.push({
                    chartType: chart.chartType,
                    chartConfig: chart.chartConfig,
                    labelList: labelList,
                    attribute: f.attribute,
                    title: chart.title,
                    data: f.groups.filter(g => !g.drilldown).map((d)=>({
                        label: chart.chartType === ChartType.barplot ? d.label.toUpperCase() : d.label,
                        population:d.population
                    }))
                });
            }
        });
        return out;
    }

    public static subtractDrilldowns(partial: Array<RcsbChartInterface>, full: Array<RcsbChartInterface>): Array<RcsbChartInterface>{
        const fullCopy: Array<RcsbChartInterface> = cloneDeep<Array<RcsbChartInterface>>(full);
        const fullMap: Map<string,Map<string|number,RcsbChartDataInterface>> = new Map<string, Map<string, RcsbChartDataInterface>>();
        fullCopy.forEach(fullChart=>{
            fullMap.set( fullChart.attribute, new Map<string, RcsbChartDataInterface>() );
            fullChart.data.forEach(d=>{
                fullMap.get(fullChart.attribute).set(d.label,d);
            });
        });
        partial.forEach(partialChart=>{
            partialChart.data.forEach(d=>{
                const data: RcsbChartDataInterface = fullMap.get(partialChart.attribute)?.get(d.label);
                data.population -= d.population;
            });
        });
        return fullCopy;
    }

    private static getFacetChartTypeByAttribute(facetMembers: FacetMemberInterface[], attribute: string): {chartType: ChartType, chartConfig?: ChartConfigInterface, title: string} {
        const facet: FacetMemberInterface = facetMembers.filter((facet)=>(facet.attribute === attribute))[0];
        return {chartType: facet.chartType, chartConfig:facet.chartConfig, title: facet.title};
    }
}

