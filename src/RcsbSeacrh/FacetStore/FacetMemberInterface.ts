import {
    CardinalityFacet,
    DateHistogramFacet, DateRangeFacet, FilterFacet,
    HistogramFacet, RangeFacet,
    TermsFacet
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {ChartConfigInterface, ChartType} from "../../RcsbChartWeb/RcsbChartView/ChartViewInterface";

export type FacetType = TermsFacet | HistogramFacet | DateHistogramFacet | RangeFacet | DateRangeFacet | CardinalityFacet  | FilterFacet;

export interface FacetMemberInterface {
    id: string;
    title: string;
    attributeName: string;
    attribute: string;
    chartType: ChartType;
    chartConfig?: ChartConfigInterface;
    facet: FacetType;
    contentType:"date"|"number"|"string";
}