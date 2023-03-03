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
    ChartObjectInterface, ChartType,
} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";

export type SearchFilter = {attribute:string;value:AttributeTextQueryParameters['value'];operator:Operator;service:Service.Text|Service.TextChem};
export interface RcsbChartInterface {
    chartType: ChartType;
    labelList?: string[];
    attribute: string;
    attributeName: string;
    chartConfig?: ChartConfigInterface,
    title?: string,
    data: ChartObjectInterface[];
    filters?:SearchFilter[];
    contentType:FacetMemberInterface['contentType'];
}


export class FacetTools {

    public static getResultDrilldowns(facetMembers: FacetMemberInterface[], searchResultFacets: Array<BucketFacet>, labelList?:string[], recursiveOut?: Array<RcsbChartInterface>): Array<RcsbChartInterface>{
        const out: Array<RcsbChartInterface> = recursiveOut ?? new Array<RcsbChartInterface>();
        searchResultFacets.forEach(f=> {
            const facet = FacetTools.getFacetFromName(facetMembers,f.name);
            if(!facet)
                return;
            const bucketFacet:BucketFacet = facet.transformSearchResultFacets ? facet.transformSearchResultFacets(f) : f;
            if(bucketFacet.buckets.filter(g=>g.drilldown).length > 0){
                bucketFacet.buckets.filter(g=>g.drilldown).forEach(g=>{
                    FacetTools.getResultDrilldowns(facetMembers, g.drilldown as BucketFacet[], labelList ? labelList.concat(g.label) : [g.label], out);
                });
            }
            if(bucketFacet.buckets.filter(g=>!g.drilldown).length > 0) {
                const chart: {chartType: ChartType; chartConfig?: ChartConfigInterface; title?: string;} = FacetTools.getFacetChartTypeFromAttribute(facetMembers, bucketFacet.name);
                const bf = FacetTools.getFacetFromName(facetMembers, bucketFacet.name);
                if(bf)
                    out.push({
                        chartType: chart.chartType,
                        chartConfig: chart.chartConfig,
                        labelList: labelList,
                        attributeName: bucketFacet.name,
                        attribute: bf.attribute,
                        title: chart.title,
                        data: bucketFacet.buckets.filter(g => !g.drilldown).map((d)=>({
                            label: d.label,
                            population: d.population
                        })),
                        filters:FacetTools.getFacetFiltersFromName(facetMembers, bucketFacet.name),
                        contentType: bf.contentType
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
                dataMap.get(fullChart.attributeName)?.set(d.label,d);
            });
        });
        partial.forEach(partialChart=>{
            partialChart.data.forEach(d=>{
                const data: ChartObjectInterface | undefined = dataMap.get(partialChart.attributeName)?.get(d.label);
                if(data)
                    data.population -= d.population;
            });
        });
        FacetTools.includeMissingFacets(partial, diff);
        return diff;
    }

    public static getFacetFromName(facetMembers: FacetMemberInterface[], name: string): FacetMemberInterface | undefined {
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

    private static getFacetChartTypeFromAttribute(facetMembers: FacetMemberInterface[], attribute: string): {chartType: ChartType, chartConfig?: ChartConfigInterface, title?: string} {
        const facet: FacetMemberInterface | undefined = facetMembers.find((facet)=>(facet.attributeName === attribute));
        if(!facet)
            throw `Unknown facet attribute ${attribute}`;
        return {chartType: facet.chartType, chartConfig:facet.chartConfig, title: facet.title};
    }

    private static getFacetFiltersFromName(facetMembers: FacetMemberInterface[], attribute: string): SearchFilter[] {
        const facet: FacetMemberInterface | undefined = facetMembers.find((facet)=>(facet.attributeName === attribute));
        if(!facet)
            throw `Unknown facet attribute ${attribute}`;
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


