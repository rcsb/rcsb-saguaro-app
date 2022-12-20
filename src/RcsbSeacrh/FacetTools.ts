import {BucketFacet} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {FacetMemberInterface} from "./FacetStore/FacetMemberInterface";
import {cloneDeep} from "lodash";
import {
    AttributeTextQueryParameters,
    FilterFacet,
    FilterQueryTerminalNode
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {Operator, Service} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {
    ChartConfigInterface, ChartDisplayConfigInterface,
    ChartObjectInterface,
} from "@rcsb/rcsb-charts/build/dist/RcsbChartComponent/ChartConfigInterface";
import {ChartType} from "@rcsb/rcsb-charts";

export type SearchFilter = {attribute:string;value:AttributeTextQueryParameters['value'];operator:Operator;service:Service.Text|Service.TextChem};
export interface RcsbChartInterface {
    chartType: ChartType;
    labelList?: string[];
    attribute: string;
    attributeName: string;
    chartConfig?: ChartConfigInterface,
    title: string,
    data: ChartObjectInterface[];
    filters?:SearchFilter[];
    contentType:FacetMemberInterface['contentType'];
}


export class FacetTools {

    public static getResultDrilldowns(facetMembers: FacetMemberInterface[], searchResultFacets: Array<BucketFacet>, labelList?:string[], recursiveOut?: Array<RcsbChartInterface>): Array<RcsbChartInterface>{
        const out: Array<RcsbChartInterface> = recursiveOut ?? new Array<RcsbChartInterface>();
        searchResultFacets.forEach(f=> {
            const facet:BucketFacet = FacetTools.getFacetFromName(facetMembers,f.name).transformSearchResultFacets ? FacetTools.getFacetFromName(facetMembers,f.name).transformSearchResultFacets(f) : f;
            if(facet.buckets.filter(g=>g.drilldown).length > 0){
                facet.buckets.filter(g=>g.drilldown).forEach(g=>{
                    FacetTools.getResultDrilldowns(facetMembers, g.drilldown as BucketFacet[], labelList ? labelList.concat(g.label) : [g.label], out);
                });
            }
            if(facet.buckets.filter(g=>!g.drilldown).length > 0) {
                const chart: {chartType: ChartType; chartConfig?: ChartConfigInterface; title: string;} = FacetTools.getFacetChartTypeFromAttribute(facetMembers, facet.name);
                out.push({
                    chartType: chart.chartType,
                    chartConfig: chart.chartConfig,
                    labelList: labelList,
                    attributeName: facet.name,
                    attribute: FacetTools.getFacetFromName(facetMembers, facet.name).attribute,
                    title: chart.title,
                    data: facet.buckets.filter(g => !g.drilldown).map((d)=>({
                        label: d.label,
                        population: d.population
                    })),
                    filters:FacetTools.getFacetFiltersFromName(facetMembers, facet.name),
                    contentType: FacetTools.getFacetFromName(facetMembers,facet.name).contentType
                });
            }
        });
        return out;
    }

    public static subtractDrilldowns(partial: Array<RcsbChartInterface>, full: Array<RcsbChartInterface>): Array<RcsbChartInterface>{
        const diff: Array<RcsbChartInterface> = cloneDeep<Array<RcsbChartInterface>>(full);
        const dataMap: Map<string,Map<string|number,ChartObjectInterface>> = new Map<string, Map<string, ChartObjectInterface>>();
        diff.forEach(fullChart=>{
            dataMap.set( fullChart.attributeName, new Map<string, ChartObjectInterface>() );
            fullChart.data.forEach(d=>{
                dataMap.get(fullChart.attributeName).set(d.label,d);
            });
        });
        partial.forEach(partialChart=>{
            partialChart.data.forEach(d=>{
                const data: ChartObjectInterface = dataMap.get(partialChart.attributeName)?.get(d.label);
                if(data)
                    data.population -= d.population;
            });
        });
        FacetTools.includeMissingFacets(partial, diff);
        return diff;
    }

    public static getFacetFromName(facetMembers: FacetMemberInterface[], name: string): FacetMemberInterface {
        return facetMembers.find((facet)=>(facet.attributeName === name));
    }

    public static addChartDisplayConfig(chart: RcsbChartInterface, chartDisplayConfig: Partial<ChartDisplayConfigInterface>) {
        return {
            ...chart,
            chartConfig:{
                ...chart.chartConfig,
                chartDisplayConfig: chartDisplayConfig
            }
        }
    }

    private static includeMissingFacets(partial: Array<RcsbChartInterface>,full: Array<RcsbChartInterface>): void {
        const partialFacetNameSet: Set<string> = new Set<string>(partial.map(f=>f.attributeName));
        const fullFacetNameSet: Map<string, RcsbChartInterface> = new Map<string,RcsbChartInterface>(full.map(f=>[f.attributeName,f]));
        fullFacetNameSet.forEach((v,k)=>{
            if(!partialFacetNameSet.has(k)){
                partial.push( {...cloneDeep<RcsbChartInterface>(v), data:[]} );
            }
        });
    }

    private static getFacetChartTypeFromAttribute(facetMembers: FacetMemberInterface[], attribute: string): {chartType: ChartType, chartConfig?: ChartConfigInterface, title: string} {
        const facet: FacetMemberInterface = facetMembers.find((facet)=>(facet.attributeName === attribute));
        return {chartType: facet.chartType, chartConfig:facet.chartConfig, title: facet.title};
    }

    private static getFacetFiltersFromName(facetMembers: FacetMemberInterface[], name: string): SearchFilter[] {
        const facet: FacetMemberInterface = facetMembers.find((facet)=>(facet.attributeName === name));
        if(!facet)
            return;
        const filters: Array<FilterQueryTerminalNode> = new Array<FilterQueryTerminalNode>();
        if( (facet.facet as FilterFacet).filter ){
            filters.push((facet.facet as FilterFacet).filter as FilterQueryTerminalNode);
        }
        //TODO second level filters should be considered. However, when included, in some cases e.g. SCOP, the search service returns empty results
        /*const facets = (facet.facet as TermsFacet | HistogramFacet | DateHistogramFacet | RangeFacet | DateRangeFacet | FilterFacet).facets;
        if( facets ){
           facets.forEach(facet=>{
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


