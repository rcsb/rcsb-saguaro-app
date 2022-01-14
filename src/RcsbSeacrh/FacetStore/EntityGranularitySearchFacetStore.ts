import {
    AggregationType,
    Operator,
    ReturnType,
    Service, Type
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {ChartType} from "../../RcsbChartWeb/RcsbChartView/ChartViewInterface";
import {FacetMemberInterface} from "./FacetMemberInterface";
import {FacetStoreInterface} from "./FacetStoreInterface";

import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";

class EntityGranularitySearchFacetStore implements FacetStoreInterface{
    private readonly entryFacet: FacetMemberInterface[] = [{
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

    private readonly instanceFacet: FacetMemberInterface[] = [{
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
                type: Type.Terminal,
                service: Service.Text,
                parameters:{
                    operator: Operator.ExactMatch,
                    attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.Type.path,
                    value: 'SCOP'
                }
            },
            facets:[{
                filter:{
                    type: Type.Terminal,
                    service: Service.Text,
                    parameters:{
                        operator: Operator.Equals,
                        value: 1,
                        attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Depth.path
                    }
                },
                facets:[{
                    min_interval_population: 1,
                    attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path,
                    aggregation_type: AggregationType.Terms
                }]

            }]
        }
    }];

    private readonly entityFacet: FacetMemberInterface[] = [{
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

    private readonly nonPolymerFacet: FacetMemberInterface[] = [{
        id:"chemp_comp",
        title:"CHEMICAL COMPONENT",
        attribute: RcsbSearchMetadata.ChemComp.Type.path,
        chartType: ChartType.barplot,
        chartConfig:{
            mostPopulatedGroups: 5,
            mergeName: "OTHER COMPS"
        },
        facet:{
            aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.ChemComp.Type.path,
            min_interval_population: 1
        }
    }];

    getServices(): Service[] {
        return [Service.Text, Service.Chemical];
    }

    getFacetService(service: Service|"all"): FacetMemberInterface[] {
        switch (service){
            case Service.Text:
                return this.entryFacet.concat(this.instanceFacet).concat(this.entityFacet);
            case Service.TextChem:
                return this.nonPolymerFacet;
            case "all":
                return this.entryFacet.concat(this.instanceFacet).concat(this.entityFacet).concat(this.nonPolymerFacet);
            default:
                return [];
        }
    }

    readonly facetLayoutGrid: [string,string?][] = [
        [RcsbSearchMetadata.RcsbEntryInfo.DiffrnResolutionHigh.Value.path],
        [RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiScientificName.path, RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiParentScientificName.path],
        [RcsbSearchMetadata.Exptl.Method.path, RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path],
    ];

    readonly returnType: ReturnType = ReturnType.PolymerEntity;
}

export const entityGranularityGroupFacetStore: EntityGranularitySearchFacetStore = new EntityGranularitySearchFacetStore();