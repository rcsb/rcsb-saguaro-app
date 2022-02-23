import {Facet} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {ChartConfigInterface, ChartType} from "../RcsbChartWeb/RcsbChartView/ChartViewInterface";
import {FacetMemberInterface, FacetType} from "./FacetStore/FacetMemberInterface";
import cloneDeep from 'lodash/cloneDeep';
import {
    AttributeTextQueryParameters,
    DateHistogramFacet, DateRangeFacet,
    FilterFacet,
    FilterQueryTerminalNode, HistogramFacet, RangeFacet, TermsFacet
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {Operator, Service} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";

export interface RcsbChartDataInterface {
    label: string|number;
    population: number;
}

export type SearchFilter = {attribute:string;value:AttributeTextQueryParameters['value'];operator:Operator;service:Service.Text|Service.TextChem};
export interface RcsbChartInterface {
    chartType: ChartType;
    labelList?: string[];
    attribute: string;
    attributeName: string;
    chartConfig?: ChartConfigInterface,
    title: string,
    data: RcsbChartDataInterface[];
    filters?:SearchFilter[];
    contentType:FacetMemberInterface['contentType'];
}


export class FacetTools {

    public static getResultDrilldowns(facetMembers: FacetMemberInterface[], searchResultFacets: Array<Facet>, labelList?:string[], recursiveOut?: Array<RcsbChartInterface>): Array<RcsbChartInterface>{
        const out: Array<RcsbChartInterface> = recursiveOut ?? new Array<RcsbChartInterface>();
        searchResultFacets.forEach(f=> {
            const facet:Facet = FacetTools.getFacetFromName(facetMembers,f.attribute).filterSearchResultFacets ? FacetTools.getFacetFromName(facetMembers,f.attribute).filterSearchResultFacets(f) : f;
            if(facet.groups.filter(g=>g.drilldown).length > 0){
                facet.groups.filter(g=>g.drilldown).forEach(g=>{
                    FacetTools.getResultDrilldowns(facetMembers, g.drilldown as Facet[], labelList ? labelList.concat(g.label) : [g.label], out);
                });
            }
            if(facet.groups.filter(g=>!g.drilldown).length > 0) {
                const chart: {chartType: ChartType; chartConfig?: ChartConfigInterface; title: string;} = FacetTools.getFacetChartTypeFromAttribute(facetMembers, facet.attribute);
                out.push({
                    chartType: chart.chartType,
                    chartConfig: chart.chartConfig,
                    labelList: labelList,
                    attributeName: facet.attribute,
                    attribute: FacetTools.getFacetFromName(facetMembers, facet.attribute).attribute,
                    title: chart.title,
                    data: facet.groups.filter(g => !g.drilldown).map((d)=>({
                        label: d.label,
                        population: d.population
                    })),
                    filters:FacetTools.getFacetFiltersFromName(facetMembers, facet.attribute),
                    contentType: FacetTools.getFacetFromName(facetMembers,facet.attribute).contentType
                });
            }
        });
        return out;
    }

    public static subtractDrilldowns(partial: Array<RcsbChartInterface>, full: Array<RcsbChartInterface>): Array<RcsbChartInterface>{
        const fullCopy: Array<RcsbChartInterface> = cloneDeep<Array<RcsbChartInterface>>(full);
        const fullMap: Map<string,Map<string|number,RcsbChartDataInterface>> = new Map<string, Map<string, RcsbChartDataInterface>>();
        fullCopy.forEach(fullChart=>{
            fullMap.set( fullChart.attributeName, new Map<string, RcsbChartDataInterface>() );
            fullChart.data.forEach(d=>{
                fullMap.get(fullChart.attributeName).set(d.label,d);
            });
        });
        partial.forEach(partialChart=>{
            partialChart.data.forEach(d=>{
                const data: RcsbChartDataInterface = fullMap.get(partialChart.attributeName)?.get(d.label);
                if(data)
                    data.population -= d.population;
            });
        });
        return fullCopy;
    }

    private static getFacetChartTypeFromAttribute(facetMembers: FacetMemberInterface[], attribute: string): {chartType: ChartType, chartConfig?: ChartConfigInterface, title: string} {
        const facet: FacetMemberInterface = facetMembers.find((facet)=>(facet.attributeName === attribute));
        return {chartType: facet.chartType, chartConfig:facet.chartConfig, title: facet.title};
    }

    private static getFacetFromName(facetMembers: FacetMemberInterface[], name: string): FacetMemberInterface {
        return facetMembers.find((facet)=>(facet.attributeName === name));
    }

    private static getFacetFiltersFromName(facetMembers: FacetMemberInterface[], name: string): SearchFilter[] {
        const facet: FacetMemberInterface = facetMembers.find((facet)=>(facet.attributeName === name));
        if(!facet)
            return;
        const filters: Array<FilterQueryTerminalNode> = new Array<FilterQueryTerminalNode>();
        if( (facet.facet as FilterFacet).filter ){
            filters.push((facet.facet as FilterFacet).filter as FilterQueryTerminalNode);
        }
        /*if( (facet.facet as TermsFacet | HistogramFacet | DateHistogramFacet | RangeFacet | DateRangeFacet | FilterFacet).facets ){
            (facet.facet as TermsFacet | HistogramFacet | DateHistogramFacet | RangeFacet | DateRangeFacet | FilterFacet).facets.forEach(facet=>{
                if((facet as FilterFacet).filter ){
                    filters.push((facet as FilterFacet).filter as FilterQueryTerminalNode);
                }
            })
        }*/
        return filters.map((f)=>({
                operator: f.parameters.operator as Operator,
                value: f.parameters.value,
                attribute: f.parameters.attribute,
                service: f.service as Service.Text|Service.TextChem
            }))
    }
}


