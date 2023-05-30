
import {ChartConfigInterface, ChartType} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";
import {
    AttributeFacetType,
    FilterFacetType
} from "@rcsb/rcsb-search-tools/lib/SearchParseTools/SearchFacetInterface";
import {RcsbSearchAttributeType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";

export type FacetType = AttributeFacetType  | FilterFacetType;

export interface FacetMemberInterface {
    id: string;
    title?: string;
    attributeName: string;
    attribute: RcsbSearchAttributeType;
    chartType: ChartType;
    chartConfig?: ChartConfigInterface & { mergeDomainMaxValue?:number; };
    facet: FacetType;
    contentType:"date"|"number"|"string";
}