import {AggregationType, Operator, ReturnType} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchEnums";
import {ChartType} from "../../RcsbChartWeb/RcsbChartView/ChartViewInterface";
import {FacetMemberInterface} from "./FacetMemberInterface";
import {FacetStoreInterface} from "./FacetStoreInterface";

import {RcsbSearchMetadata} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchMetadata";

class EntityGranularitySearchFacetStore implements FacetStoreInterface{
    readonly entryFacet: FacetMemberInterface[] = [{
        id: "method",
        title: "EXPERIMENTAL METHOD",
        attribute: RcsbSearchMetadata.Exptl.Method.path,
        chartType: ChartType.barplot,
        chartConfig: {
            mostPopulatedGroups: 3,
            mergeName: "OTHER METHODS"
        },
        facet: {
            aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.Exptl.Method.path,
        }
    },{
        id:"resolution",
        title:"RESOLUTION",
        attribute: RcsbSearchMetadata.RcsbEntryInfo.DiffrnResolutionHigh.Value.path,
        chartType: ChartType.histogram,
        chartConfig:{
            tickIncrement:{
                origin: 0.5,
                increment: 0.5
            },
            mergeDomainMaxValue:4.5,
            domainMinValue: 0
        },
        facet:{
            aggregation_type: AggregationType.Histogram,
            attribute: RcsbSearchMetadata.RcsbEntryInfo.DiffrnResolutionHigh.Value.path,
            interval: 0.5,
            min_interval_population: 1
        }
    }];

    readonly instanceFacet: FacetMemberInterface[] = [{
        id:"scop_class",
        title:"SCOP CLASS",
        attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path,
        chartType: ChartType.barplot,
        chartConfig: {
            mostPopulatedGroups: 5,
            mergeName: "OTHER CLASSES"
        },
        facet:{
            filter:{
                operator: Operator.ExactMatch,
                attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.Type.path,
                value: 'SCOP'
            },
            facets:[{
                filter:{
                    operator: Operator.Equals,
                    value: 1,
                    attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Depth.path
                },
                min_interval_population: 1,
                attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path,
                aggregation_type: AggregationType.Terms
            }]
        }
    }];

    readonly entityFacet: FacetMemberInterface[] = [{
        id:"organism",
        title:"ORGANISM",
        attribute: RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiScientificName.path,
        chartType: ChartType.barplot,
        chartConfig: {
            mostPopulatedGroups: 5,
            mergeName: "OTHER ORGANISMS"
        },
        facet:{
            aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiScientificName.path
        }
    }, {
        id: "taxonomy",
        title: "TAXONOMY",
        attribute: RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiParentScientificName.path,
        chartType: ChartType.barplot,
        chartConfig: {
            mostPopulatedGroups: 5,
            mergeName: "OTHER TAXONOMIES"
        },

        facet: {
            aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiParentScientificName.path
        }
    }];

    readonly facetLayoutGrid: [string,string?][] = [
        [RcsbSearchMetadata.RcsbEntryInfo.DiffrnResolutionHigh.Value.path],
        [RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiScientificName.path, RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiParentScientificName.path],
        [RcsbSearchMetadata.Exptl.Method.path, RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path],
    ];

    readonly returnType: ReturnType = ReturnType.PolymerEntity;
}

export const entityGranularityGroupFacetStore: EntityGranularitySearchFacetStore = new EntityGranularitySearchFacetStore();