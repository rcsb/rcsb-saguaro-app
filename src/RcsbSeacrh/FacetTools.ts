import {BucketFacet} from "@rcsb/rcsb-api-tools/lib/RcsbSearch/Types/SearchResultInterface";
import {FacetMemberInterface} from "./FacetStore/FacetMemberInterface";
import {cloneDeep} from "lodash";
import {
    AttributeTextQueryParameters,
    FilterFacet
} from "@rcsb/rcsb-api-tools/lib/RcsbSearch/Types/SearchQueryInterface";
import {Service} from "@rcsb/rcsb-api-tools/lib/RcsbSearch/Types/SearchEnums";
import {
    ChartDisplayConfigInterface,
    ChartObjectInterface,
} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";
import {RcsbSearchAttributeType} from "@rcsb/rcsb-api-tools/lib/RcsbSearch/Types/SearchMetadata";
import {
    BucketDataType,
    FilterFacetType,
    FilterQueryTerminalNodeType, SearchBucketFacetType
} from "@rcsb/rcsb-search-tools/lib/SearchParseTools/SearchFacetInterface";
import {getBucketsFromFacets} from "@rcsb/rcsb-search-tools/lib/SearchParseTools/SearchFacetTools";

export type SearchFilter = {attribute:RcsbSearchAttributeType;value:AttributeTextQueryParameters['value'];operator:AttributeTextQueryParameters["operator"];service:Service.Text|Service.TextChem};
export interface RcsbChartInterface<T=any> extends Omit<FacetMemberInterface, "id"|"facet">{
    data: ChartObjectInterface<T>[];
    filters?:SearchFilter[];
}

export class FacetTools {

    public static getResultDrilldowns(facetMembers: FacetMemberInterface[], searchResultFacets: Array<BucketFacet>): Array<RcsbChartInterface> {
        const out: Array<RcsbChartInterface> = new Array<RcsbChartInterface>();
        const bucketList: SearchBucketFacetType[] = getBucketsFromFacets(searchResultFacets);
        bucketList.forEach(bucket=>{
            const facet = FacetTools.getFacetFromName(facetMembers,bucket.name);
            if(!facet)
                return;
            const chart= FacetTools.getFacetChartTypeFromAttribute(facetMembers, bucket.name);
            out.push({
                ...chart,
                attributeName: bucket.name,
                attribute: facet.attribute,
                data: applyChartConfigToData(bucket, facet?.facetConfig),
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

    private static getFacetChartTypeFromAttribute(facetMembers: FacetMemberInterface[], attribute: string):FacetMemberInterface {
        const facet: FacetMemberInterface | undefined = facetMembers.find((facet)=>(facet.attributeName === attribute));
        if(!facet)
            throw `Unknown facet attribute ${attribute}`;
        return facet;
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

function applyChartConfigToData(bucket: SearchBucketFacetType, facetConfig?: FacetMemberInterface["facetConfig"]): BucketDataType[] {
    if(facetConfig?.mergeDomainMaxValue)
        return mergeDomainMaxValue(bucket.data, facetConfig.mergeDomainMaxValue)
    if(facetConfig?.facetTransform)
       return  facetConfig.facetTransform(bucket.data)
    return bucket.data;
}

function mergeDomainMaxValue(data: BucketDataType[], domMaxValue: number): BucketDataType[] {
    const n = data.filter(d=> parseFloat(d.label.toString()) >= domMaxValue).reduce((prev, curr)=>prev+curr.population,0);
    return n > 0 ? data.filter(d=> parseFloat(d.label.toString()) < domMaxValue).concat({
        population: n,
        label: domMaxValue,
        labelPath: [domMaxValue.toString()]
    }) : data;
}


