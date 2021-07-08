import {
    CardinalityFacet,
    DateHistogramFacet,
    DateRangeFacet,
    FilterFacet,
    HistogramFacet,
    RangeFacet,
    TermsFacet
} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchQueryInterface";
import {AggregationType, Operator} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchEnums";
import {
    CoreEntry,
    CorePolymerEntity,
    CorePolymerEntityInstance
} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Yosemite/CorePaths";
import {ChartConfigInterface, ChartType} from "../../RcsbChartWeb/RcsbChartView/ChartViewInterface";

export type FacetType = TermsFacet | HistogramFacet | DateHistogramFacet | RangeFacet | DateRangeFacet | CardinalityFacet  | FilterFacet;

export interface FacetStoreInterface {
    attribute: string;
    chartType: ChartType;
    chartConfig?: ChartConfigInterface;
    facet: FacetType;
}

export const EntryFacet: FacetStoreInterface[] = [{
    attribute: CoreEntry.Exptl.Method,
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 3,
        mergeName: "OTHER METHODS"
    },
    facet: {
        aggregation_type: AggregationType.Terms,
        attribute: CoreEntry.Exptl.Method,
    }
},{
    attribute: CoreEntry.RcsbEntryInfo.DiffrnResolutionHigh.Value,
    chartType: ChartType.histogram,
    chartConfig:{
        tickIncrement:{
            origin: 0.5,
            increment: 0.5
        },
        mergeDomainMaxValue:4.5
    },
    facet:{
        aggregation_type: AggregationType.Histogram,
        attribute: CoreEntry.RcsbEntryInfo.DiffrnResolutionHigh.Value,
        interval: 0.5,
        min_interval_population: 1
    }
}];

export const InstanceFacet: FacetStoreInterface[] = [{
    attribute: CorePolymerEntityInstance.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name,
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 5,
        mergeName: "OTHER CLASSES"
    },
    facet:{
        filter:{
            operator: Operator.ExactMatch,
            attribute: CorePolymerEntityInstance.RcsbPolymerInstanceAnnotation.Type,
            value: 'SCOP'
        },
        facets:[{
            filter:{
                operator: Operator.Equals,
                value: 1,
                attribute: CorePolymerEntityInstance.RcsbPolymerInstanceAnnotation.AnnotationLineage.Depth
            },
            min_interval_population: 1,
            attribute: CorePolymerEntityInstance.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name,
            aggregation_type: AggregationType.Terms
        }]
    }
}];

export const EntityFacet: FacetStoreInterface[] = [{
        attribute: CorePolymerEntity.RcsbEntitySourceOrganism.NcbiScientificName,
        chartType: ChartType.barplot,
        chartConfig: {
            mostPopulatedGroups: 5,
            mergeName: "OTHER ORGANISMS"
        },
        facet:{
            aggregation_type: AggregationType.Terms,
            attribute: CorePolymerEntity.RcsbEntitySourceOrganism.NcbiScientificName
        }
    }];