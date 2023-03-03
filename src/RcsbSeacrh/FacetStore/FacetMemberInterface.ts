import {
    CardinalityFacet,
    DateHistogramFacet, DateRangeFacet, FilterFacet,
    HistogramFacet, RangeFacet,
    TermsFacet
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {BucketFacet} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {ChartConfigInterface, ChartType} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";

export type FacetType = TermsFacet | HistogramFacet | DateHistogramFacet | RangeFacet | DateRangeFacet | CardinalityFacet  | FilterFacet;

export interface FacetMemberInterface {
    id: string;
    title?: string;
    attributeName: string;
    attribute: string;
    chartType: ChartType;
    chartConfig?: ChartConfigInterface;
    facet: FacetType;
    contentType:"date"|"number"|"string";
    transformSearchResultFacets?(facets: BucketFacet):BucketFacet;
}