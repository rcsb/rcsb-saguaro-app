
import {ChartConfigInterface, ChartType} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";
import {
    AttributeFacetType, BucketDataType,
    FilterFacetType
} from "@rcsb/rcsb-search-tools/lib/SearchParseTools/SearchFacetInterface";
import {RcsbSearchAttributeType} from "@rcsb/rcsb-api-tools/lib/RcsbSearch/Types/SearchMetadata";
import {SearchQueryType} from "@rcsb/rcsb-search-tools/lib/SearchQueryTools/SearchQueryInterfaces";
import {
    ChartDataColumnInterface,
    ChartDataValueInterface
} from "@rcsb/rcsb-charts/lib/RcsbChartDataProvider/ChartDataProviderInterface";
import React from "react";

export type FacetType = AttributeFacetType  | FilterFacetType;

export interface FacetMemberInterface {
    id: string;
    title?: string;
    attributeName: string;
    attribute: RcsbSearchAttributeType;
    chartType: ChartType;
    chartConfig?: ChartConfigInterface;
    facetConfig?: FacetConfigInterface;
    facet: FacetType;
    contentType:"date"|"number"|"string";
}

export interface FacetConfigInterface {
    mergeDomainMaxValue?: number;
    facetTransform?: (d: BucketDataType[])=>BucketDataType[];
    bucketClickSearchQuery?: (datum:ChartDataValueInterface, data: ChartDataColumnInterface[], e?: React.MouseEvent)=>SearchQueryType;
}