import {BucketFacet} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {FacetMemberInterface} from "./FacetStore/FacetMemberInterface";
import {cloneDeep} from "lodash";
import {
    AttributeTextQueryParameters,
    FilterFacet
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {Service} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {
    ChartConfigInterface, ChartDisplayConfigInterface,
    ChartObjectInterface, ChartType,
} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";
import {RcsbSearchAttributeType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import {
    BucketDataType,
    FilterFacetType,
    FilterQueryTerminalNodeType, SearchBucketFacetType
} from "@rcsb/rcsb-search-tools/lib/SearchParseTools/SearchFacetInterface";
import {getBucketsFromFacets} from "@rcsb/rcsb-search-tools/lib/SearchParseTools/SearchFacetTools";

export type SearchFilter = {attribute:RcsbSearchAttributeType;value:AttributeTextQueryParameters['value'];operator:AttributeTextQueryParameters["operator"];service:Service.Text|Service.TextChem};
export interface RcsbChartInterface<T=any> {
    chartType: ChartType;
    labelList?: string[];
    attribute: RcsbSearchAttributeType;
    attributeName: string;
    chartConfig?: FacetMemberInterface["chartConfig"],
    title?: string,
    data: ChartObjectInterface<T>[];
    filters?:SearchFilter[];
    contentType:FacetMemberInterface['contentType'];
}

export class FacetTools {

    public static getResultDrilldowns(facetMembers: FacetMemberInterface[], searchResultFacets: Array<BucketFacet>): Array<RcsbChartInterface> {
        const out: Array<RcsbChartInterface> = new Array<RcsbChartInterface>();
        const bucketList: SearchBucketFacetType[] = getBucketsFromFacets(searchResultFacets);
        bucketList.forEach(bucket=>{
            const facet = FacetTools.getFacetFromName(facetMembers,bucket.name);
            if(!facet)
                return;
            const chart: {chartType: ChartType; chartConfig?: ChartConfigInterface; title?: string;} = FacetTools.getFacetChartTypeFromAttribute(facetMembers, bucket.name);
            out.push({
                chartType: chart.chartType,
                chartConfig: chart.chartConfig,
                labelList: [],
                attributeName: bucket.name,
                attribute: facet.attribute,
                title: chart.title,
                data: applyChartConfigToData(bucket.data, facet?.chartConfig),
                filters: FacetTools.getFacetFiltersFromName(facetMembers, bucket.name),
                contentType: facet.contentType
            });
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
        const filters: Array<FilterQueryTerminalNodeType> = new Array<FilterQueryTerminalNodeType>();
        if( (facet.facet as FilterFacet).filter ){
            filters.push((facet.facet as FilterFacetType).filter as FilterQueryTerminalNodeType);
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
                operator: f.parameters.operator,
                value: f.parameters.value,
                attribute: f.parameters.attribute,
                service: f.service as Service.Text|Service.TextChem
            }))
    }
}

function applyChartConfigToData(data: BucketDataType[], chartConfig?: FacetMemberInterface["chartConfig"]): BucketDataType[] {
    if(chartConfig?.mergeDomainMaxValue)
        return mergeDomainMaxValue(data, chartConfig.mergeDomainMaxValue)
    return data;
}

function mergeDomainMaxValue(data: BucketDataType[], domMaxValue: number): BucketDataType[] {
    const n = data.filter(d=> parseFloat(d.label.toString()) >= domMaxValue).reduce((prev, curr)=>prev+curr.population,0);
    return n > 0 ? data.filter(d=> parseFloat(d.label.toString()) < domMaxValue).concat({
        population: n,
        label: domMaxValue
    }) : data;
}


