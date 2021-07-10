import {AggregationType, Operator, ReturnType} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchEnums";
import {
    CoreEntry,
    CorePolymerEntity,
    CorePolymerEntityInstance
} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Yosemite/CorePaths";
import {ChartType} from "../../RcsbChartWeb/RcsbChartView/ChartViewInterface";
import {FacetMemberInterface} from "./FacetMemberInterface";
import {FacetStoreInterface} from "./FacetStoreInterface";

class UniprotEntityGroupFacetStore implements FacetStoreInterface{
    readonly entryFacet: FacetMemberInterface[] = [{
        id: "method",
        title: "EXPERIMENTAL METHOD",
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
        id:"resolution",
        title:"RESOLUTION",
        attribute: CoreEntry.RcsbEntryInfo.DiffrnResolutionHigh.Value,
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
            attribute: CoreEntry.RcsbEntryInfo.DiffrnResolutionHigh.Value,
            interval: 0.5,
            min_interval_population: 1
        }
    }];

    readonly instanceFacet: FacetMemberInterface[] = [{
        id:"scop_class",
        title:"SCOP CLASS",
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

    readonly entityFacet: FacetMemberInterface[] = [{
        id:"organism",
        title:"ORGANISM",
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
    }, {
        id: "taxonomy",
        title: "TAXONOMY",
        attribute: CorePolymerEntity.RcsbEntitySourceOrganism.NcbiParentScientificName,
        chartType: ChartType.barplot,
        chartConfig: {
            mostPopulatedGroups: 5,
            mergeName: "OTHER TAXONOMIES"
        },

        facet: {
            aggregation_type: AggregationType.Terms,
            attribute: CorePolymerEntity.RcsbEntitySourceOrganism.NcbiParentScientificName
        }
    }];

    readonly facetLayoutGrid: [string,string?][] = [
        [CoreEntry.RcsbEntryInfo.DiffrnResolutionHigh.Value],
        [CorePolymerEntity.RcsbEntitySourceOrganism.NcbiScientificName, CorePolymerEntity.RcsbEntitySourceOrganism.NcbiParentScientificName],
        [CoreEntry.Exptl.Method, CorePolymerEntityInstance.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name],
    ];


    readonly returnType: ReturnType = ReturnType.PolymerEntity;
}

export const uniprotEntityGroupFacetStore: UniprotEntityGroupFacetStore = new UniprotEntityGroupFacetStore();