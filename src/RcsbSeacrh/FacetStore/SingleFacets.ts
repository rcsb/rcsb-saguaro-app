import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import {ChartType} from "../../RcsbChartWeb/RcsbChartView/ChartViewInterface";
import {AggregationType, Service, Type} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {FacetMemberInterface} from "./FacetMemberInterface";
import {Facet} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";

export const EXPERIMENTAL_METHOD_FACET:FacetMemberInterface = {
    id: "method",
    title: "Experimental Method",
    attributeName: "EXPERIMENTAL_METHOD_FACET",
    attribute: RcsbSearchMetadata.Exptl.Method.path,
    chartType: ChartType.barplot,
    contentType: "string",
    chartConfig: {
    mostPopulatedGroups: 3,
        mergeName: "Other methods"
},
    facet: {
        name: "EXPERIMENTAL_METHOD_FACET",
        aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.Exptl.Method.path,
            min_interval_population: 1
    }
};

export const RESOLUTION_FACET:FacetMemberInterface = {
    id:"resolution",
        title:"Resolution",
        attributeName: "RESOLUTION_FACET",
    attribute: RcsbSearchMetadata.RcsbEntryInfo.ResolutionCombined.path,
    contentType:"number",
    chartType: ChartType.histogram,
        chartConfig:{
        tickIncrement:{
            origin: 0.5,
                increment: 0.5
        },
        histogramBinIncrement:0.5,
            mergeDomainMaxValue:4.5,
            domainMinValue: 0
    },
    facet:{
        name:"RESOLUTION_FACET",
        aggregation_type: AggregationType.Histogram,
            attribute: RcsbSearchMetadata.RcsbEntryInfo.ResolutionCombined.path,
            interval: 0.5,
            min_interval_population: 1
    }
};

export const RELEASE_DATE_FACET:FacetMemberInterface = {
    id:"release_date",
        title:null,
        attributeName: "RELEASE_DATE_FACET",
    attribute: RcsbSearchMetadata.RcsbAccessionInfo.InitialReleaseDate.path,
    contentType:"date",
    chartType: ChartType.histogram,
        chartConfig:{
        tickIncrement:{
            origin: 1980,
                increment: 10
        },
        histogramBinIncrement:1,
            domainMinValue: 1970
    },
    facet:{
        name:"RELEASE_DATE_FACET",
        aggregation_type: AggregationType.DateHistogram,
            attribute: RcsbSearchMetadata.RcsbAccessionInfo.InitialReleaseDate.path,
            interval: "year",
            min_interval_population: 1
    }
};

export const SCOP_FACET:FacetMemberInterface = {
    id:"scop_class",
    title:"SCOP/SCOPe domain",
    attributeName: "SCOP_FACET",
    attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path,
    contentType:"string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 10,
        mergeName: "Other domains"
    },
    facet:{
        filter:{
            type: Type.Terminal,
                service: Service.Text,
                parameters:{
                operator: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.Type.operator.ExactMatch,
                    attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.Type.path,
                    value: 'SCOP'
            }
        },
        facets:[{
            filter:{
                type: Type.Terminal,
                service: Service.Text,
                parameters:{
                    operator: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Depth.operator.Equals,
                    value: 5,
                    attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Depth.path
                }
            },
            facets:[{
                name:"SCOP_FACET",
                min_interval_population: 1,
                attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path,
                aggregation_type: AggregationType.Terms
            }]
        }]
    }
};

export const CATH_FACET:FacetMemberInterface = {
    id:"cath_class",
    title:"CATH domain",
    attributeName: "CATH_FACET",
    attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path,
    contentType:"string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 10,
        mergeName: "Other domains"
    },
    facet:{
        filter:{
            type: Type.Terminal,
            service: Service.Text,
            parameters:{
                operator: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.Type.operator.ExactMatch,
                attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.Type.path,
                value: 'CATH'
            }
        },
        facets:[{
            filter:{
                type: Type.Terminal,
                service: Service.Text,
                parameters:{
                    operator: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Depth.operator.Equals,
                    value: 4,
                    attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Depth.path
                }
            },
            facets:[{
                name:"CATH_FACET",
                min_interval_population: 1,
                attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path,
                aggregation_type: AggregationType.Terms
            }]
        }]
    }
};

export const ECOD_FACET:FacetMemberInterface = {
    id:"ecod_class",
    title:"ECOD domain",
    attributeName: "ECOD_FACET",
    attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path,
    contentType:"string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 10,
        mergeName: "Other domains"
    },
    facet:{
        filter:{
            type: Type.Terminal,
            service: Service.Text,
            parameters:{
                operator: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.Type.operator.ExactMatch,
                attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.Type.path,
                value: 'ECOD'
            }
        },
        facets:[{
            filter:{
                type: Type.Terminal,
                service: Service.Text,
                parameters:{
                    operator: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Depth.operator.Equals,
                    value: 4,
                    attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Depth.path
                }
            },
            facets:[{
                name:"ECOD_FACET",
                min_interval_population: 1,
                attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path,
                aggregation_type: AggregationType.Terms
            }]
        }]
    }
};

export const LIGAND_FACET:FacetMemberInterface = {
    id: "ligands",
    title: "Small molecules",
    attributeName: "LIGAND_FACET",
    attribute: RcsbSearchMetadata.RcsbNonpolymerEntityInstanceContainerIdentifiers.CompId.path,
    contentType:"string",
    chartType: ChartType.barplot,
        chartConfig: {
        mostPopulatedGroups: 20,
            mergeName: "Other molecules"
    },
    facet: {
        name:"LIGAND_FACET",
        aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.RcsbNonpolymerEntityInstanceContainerIdentifiers.CompId.path,
            min_interval_population: 1
    }
}

export const LIGAND_OF_INTEREST_FACET:FacetMemberInterface = {
    id: "ligands",
    title: "Ligands of interest",
    attributeName: "LIGAND_OF_INTEREST_FACET",
    attribute: RcsbSearchMetadata.RcsbNonpolymerEntityInstanceContainerIdentifiers.CompId.path,
    contentType:"string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 20,
        mergeName: "Other molecules"
    },
    facet: {
        filter:{
            type: Type.Terminal,
            service: Service.Text,
            parameters: {
                attribute: RcsbSearchMetadata.RcsbNonpolymerEntityAnnotation.Type.path,
                operator: RcsbSearchMetadata.RcsbNonpolymerEntityAnnotation.Type.operator.ExactMatch,
                value: "SUBJECT_OF_INVESTIGATION"
            }
        },
        facets:[{
            name:"LIGAND_OF_INTEREST_FACET",
            aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.RcsbNonpolymerEntityAnnotation.CompId.path,
            min_interval_population: 1
        }]
    }
}

export const ORGANISM_FACET:FacetMemberInterface = {
    id:"organism",
        title:"Organism",
    attributeName: "ORGANISM_FACET",
    attribute: RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiScientificName.path,
    contentType:"string",
    chartType: ChartType.barplot,
    chartConfig: {
    mostPopulatedGroups: 9,
        mergeName: "Other organisms"
},
    facet:{
        name:"ORGANISM_FACET",
        aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiScientificName.path,
            min_interval_population: 1
    }
};

export const TAXONOMY_FACET:FacetMemberInterface = {
    id: "taxonomy",
        title: "Taxonomy",
        attributeName: "TAXONOMY_FACET",
    attribute: RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiParentScientificName.path,
    contentType:"string",
    chartType: ChartType.barplot,
        chartConfig: {
        mostPopulatedGroups: 5,
            mergeName: "Other taxonomies"
    },
    facet: {
        name:"TAXONOMY_FACET",
        aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiParentScientificName.path,
            min_interval_population: 1
    }
};

export const PFAM_FACET: FacetMemberInterface = {
    id:"Pfam",
    title:"PFAM domain",
    attributeName: "PFAM_FACET",
    attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Name.path,
    contentType:"string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 10,
        mergeName: "Other domains"
    },
    facet:{
        filter:{
            type: Type.Terminal,
            service: Service.Text,
            parameters:{
                operator: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.operator.ExactMatch,
                attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.path,
                value: 'Pfam'
            }
        },
        facets:[{
            name:"PFAM_FACET",
            min_interval_population: 1,
            attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Name.path,
            aggregation_type: AggregationType.Terms
        }]
    }
};

export const ENTITY_NAME_FACET:FacetMemberInterface = {
    id:"entiy_names",
        title: null,
        attributeName: "ENTITY_NAME_FACET",
    attribute: RcsbSearchMetadata.RcsbPolymerEntity.RcsbPolymerNameCombined.Names.path,
    contentType:"string",
    chartType: ChartType.barplot,
        chartConfig: {
        mostPopulatedGroups: 5,
            mergeName: "Other names"
    },
    facet:{
        name:"ENTITY_NAME_FACET",
        aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.RcsbPolymerEntity.RcsbPolymerNameCombined.Names.path,
            min_interval_population: 1
    }
}

export const CHEM_COMP_FACET:FacetMemberInterface = {
    id:"chemp_comp",
    title:"Chemical Component",
    attributeName: "CHEM_COMP_FACET",
    attribute: RcsbSearchMetadata.ChemComp.Type.path,
    contentType:"string",
    chartType: ChartType.barplot,
    chartConfig:{
        mostPopulatedGroups: 5,
        mergeName: "Other comps"
    },
    facet:{
        name:"CHEM_COMP_FACET",
        aggregation_type: AggregationType.Terms,
        attribute: RcsbSearchMetadata.ChemComp.Type.path,
        min_interval_population: 1
    }
}

export const ENZYME_CLASS_FACET: FacetMemberInterface = {
    id:"enzyme_class",
    title:"Enzyme classification",
    attributeName: "ENZYME_CLASS_FACET",
    attribute: RcsbSearchMetadata.RcsbPolymerEntity.RcsbEcLineage.Name.path,
    contentType:"string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 10,
        mergeName: "Other classes"
    },
    facet:{
        filter:{
            type: Type.Terminal,
            service: Service.Text,
            parameters:{
                operator: RcsbSearchMetadata.RcsbPolymerEntity.RcsbEcLineage.Depth.operator.GreaterOrEqual,
                attribute: RcsbSearchMetadata.RcsbPolymerEntity.RcsbEcLineage.Depth.path,
                value: 3
            }
        },
        facets:[{
            name:"ENZYME_CLASS_FACET",
            aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.RcsbPolymerEntity.RcsbEcLineage.Name.path,
            min_interval_population: 1
        }]
    }
}

export const GO_FUNCTION_FACET: FacetMemberInterface = {
    id:"go_function_class",
    title:"GO molecular function",
    attributeName: "GO_FUNCTION_FACET",
    attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Name.path,
    contentType:"string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 10,
        mergeName: "Other functions"
    },
    facet:{
        filter:{
            type: Type.Terminal,
            service: Service.Text,
            parameters:{
                operator: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.operator.ExactMatch,
                attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.path,
                value: "GO"
            }
        },
        facets:[{
            name:"GO_FUNCTION_FACET",
            aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Name.path,
            max_num_intervals:1000,
            min_interval_population:1,
            facets:[{
                filter:{
                    type: Type.Terminal,
                    service: Service.Text,
                    parameters:{
                        operator: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.operator.ExactMatch,
                        attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.AnnotationLineage.Name.path,
                        value: "molecular_function"
                    }
                },
                facets:[{
                    aggregation_type: AggregationType.Terms,
                    min_interval_population: 1,
                    attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.AnnotationLineage.Name.path
                }]
            }]
        }]
    },
    transformSearchResultFacets(facet: Facet): Facet {
        return {
            attribute: facet.attribute,
            groups: facet.groups.filter((g)=>(
                g.drilldown.filter((d)=>((d as Facet).groups.filter((dg)=>(dg.label === "molecular_function"))).length>0).length > 0
            )).map((g)=>({
                label:g.label,
                population:g.population
            })) as Facet['groups']
        };
    }
}

export const GO_PROCESS_FACET: FacetMemberInterface = {
    id:"go_process_class",
    title:"GO biological process",
    attributeName: "GO_PROCESS_FACET",
    attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Name.path,
    contentType:"string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 10,
        mergeName: "Other processes"
    },
    facet:{
        filter:{
            type: Type.Terminal,
            service: Service.Text,
            parameters:{
                operator: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.operator.ExactMatch,
                attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.path,
                value: "GO"
            }
        },
        facets:[{
            name:"GO_PROCESS_FACET",
            aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Name.path,
            max_num_intervals:1000,
            min_interval_population:1,
            facets:[{
                filter:{
                    type: Type.Terminal,
                    service: Service.Text,
                    parameters:{
                        operator: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.operator.ExactMatch,
                        attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.AnnotationLineage.Name.path,
                        value: "biological_process"
                    }
                },
                facets:[{
                    aggregation_type: AggregationType.Terms,
                    min_interval_population: 1,
                    attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.AnnotationLineage.Name.path
                }]
            }]
        }]
    },
    transformSearchResultFacets(facet: Facet): Facet {
        return {
            attribute: facet.attribute,
            groups: facet.groups.filter((g)=>(
                g.drilldown.filter((d)=>((d as Facet).groups.filter((dg)=>(dg.label === "biological_process"))).length>0).length > 0
            )).map((g)=>({
                label:g.label,
                population:g.population
            })) as Facet['groups']
        };
    }
}

export const GO_COMPONENT_FACET: FacetMemberInterface = {
    id:"go_component_class",
    title:"GO cellular component",
    attributeName: "GO_COMPONENT_FACET",
    attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Name.path,
    contentType:"string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 10,
        mergeName: "Other locations"
    },
    facet:{
        filter:{
            type: Type.Terminal,
            service: Service.Text,
            parameters:{
                operator: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.operator.ExactMatch,
                attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.path,
                value: "GO"
            }
        },
        facets:[{
            name:"GO_COMPONENT_FACET",
            aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Name.path,
            max_num_intervals:1000,
            min_interval_population:1,
            facets:[{
                filter:{
                    type: Type.Terminal,
                    service: Service.Text,
                    parameters:{
                        operator: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.operator.ExactMatch,
                        attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.AnnotationLineage.Name.path,
                        value: "cellular_component"
                    }
                },
                facets:[{
                    aggregation_type: AggregationType.Terms,
                    min_interval_population: 1,
                    attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.AnnotationLineage.Name.path
                }]
            }]
        }]
    },
    transformSearchResultFacets(facet: Facet): Facet {
        return {
            attribute: facet.attribute,
            groups: facet.groups.filter((g)=>(
                g.drilldown.filter((d)=>((d as Facet).groups.filter((dg)=>(dg.label === "cellular_component"))).length>0).length > 0
            )).map((g)=>({
                label:g.label,
                population:g.population
            })) as Facet['groups']
        };
    }
}

export const SearchFacets = {
    EXPERIMENTAL_METHOD_FACET,
    RESOLUTION_FACET,
    RELEASE_DATE_FACET,
    SCOP_FACET,
    LIGAND_FACET,
    ORGANISM_FACET,
    TAXONOMY_FACET,
    PFAM_FACET,
    ENTITY_NAME_FACET,
    CHEM_COMP_FACET,
    ECOD_FACET,
    CATH_FACET,
    ENZYME_CLASS_FACET,
    GO_FUNCTION_FACET,
    GO_PROCESS_FACET,
    GO_COMPONENT_FACET,
    LIGAND_OF_INTEREST_FACET
};
