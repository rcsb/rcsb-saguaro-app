import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import {AggregationType, Service, Type} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {FacetMemberInterface} from "./FacetMemberInterface";
import {ChartType} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";
import {ChartDataValueInterface} from "@rcsb/rcsb-charts/lib/RcsbChartDataProvider/ChartDataProviderInterface";
import {GroupChartMap} from "../../RcsbGroupWeb/RcsbGroupView/RcsbGroupChart/GroupChartTools";

export const EXPERIMENTAL_METHOD_FACET: FacetMemberInterface = {
    id: "method",
    title: "Experimental Method",
    attributeName: "EXPERIMENTAL_METHOD_FACET",
    attribute: RcsbSearchMetadata.Exptl.Method.path,
    chartType: ChartType.barplot,
    contentType: "string",
    chartConfig: {
        mostPopulatedGroups: 3
    },
    facet: {
        name: "EXPERIMENTAL_METHOD_FACET",
        aggregation_type: AggregationType.Terms,
        attribute: RcsbSearchMetadata.Exptl.Method.path,
        min_interval_population: 1
    }
};

export const RESOLUTION_FACET: FacetMemberInterface = {
    id: "resolution",
    title: "Resolution",
    attributeName: "RESOLUTION_FACET",
    attribute: RcsbSearchMetadata.RcsbEntryInfo.ResolutionCombined.path,
    contentType: "number",
    chartType: ChartType.histogram,
    chartConfig: {
        tickFormat:{
            domAxis: (t: number|string)=>{
                if(parseInt(t.toString()) == 5)
                    return `> ${t}`;
                if(parseInt(t.toString()) > 5)
                    return '';
                return t.toString();
            }
        },
        chartDisplayConfig: {
            constHeight: 225
        },
        histogramBinIncrement: 0.5,
        domainMinValue: 0,
        domainMaxValue: 6,
        axisLabel: "Angstroms",
        tooltipText: (d: ChartDataValueInterface<GroupChartMap.ChartObjectIdType>)=>{
            if(d.x as number > 5)
                return "> 5"
            return `Resolution ${d.x as number - 0.25} - ${d.x as number + 0.25}`;
        }
    },
    facetConfig: {
        mergeDomainMaxValue: 5
    },
    facet: {
        name: "RESOLUTION_FACET",
        aggregation_type: AggregationType.Histogram,
        attribute: RcsbSearchMetadata.RcsbEntryInfo.ResolutionCombined.path,
        interval: 0.5,
        min_interval_population: 1,
    }
};

export const METHODOLOGY_FACET: FacetMemberInterface = {
    id: "computed",
    title: "Determination Methodology",
    attributeName: "METHODOLOGY_FACET",
    attribute: RcsbSearchMetadata.RcsbEntryInfo.StructureDeterminationMethodology.path,
    chartType: ChartType.barplot,
    contentType: "string",
    chartConfig: {
        mostPopulatedGroups: 3
    },
    facet: {
        name: "METHODOLOGY_FACET",
        aggregation_type: AggregationType.Terms,
        attribute: RcsbSearchMetadata.RcsbEntryInfo.StructureDeterminationMethodology.path,
        min_interval_population: 1
    }
};

export const TAXONOMY_COUNT_FACET: FacetMemberInterface = {
    id: "taxonomy_count",
    title: "Number of Source Taxonomies",
    attributeName: "TAXONOMY_COUNT_FACET",
    attribute: RcsbSearchMetadata.RcsbPolymerEntity.RcsbSourceTaxonomyCount.path,
    chartType: ChartType.histogram,
    contentType: "number",
    chartConfig: {
        histogramBinIncrement: 0,
        tickFormat:{
            domAxis: (t: number|string)=>{
                if(t.toString().includes('.'))
                    return '';
                return t.toString();
            }
        },
        chartDisplayConfig: {
            constHeight: 225
        },
        domainMinValue: 0,
        axisLabel: "Taxonomy count",
        tooltipText: (d: ChartDataValueInterface<GroupChartMap.ChartObjectIdType>)=>{
            return `Taxonomy count ${d.x}`;
        }
    },
    facet: {
        name: "TAXONOMY_COUNT_FACET",
        aggregation_type: AggregationType.Histogram,
        attribute: RcsbSearchMetadata.RcsbPolymerEntity.RcsbSourceTaxonomyCount.path,
        min_interval_population: 1,
        interval: 1
    }
};

export const RELEASE_DATE_FACET: FacetMemberInterface = {
    id: "release_date",
    title: undefined,
    attributeName: "RELEASE_DATE_FACET",
    attribute: RcsbSearchMetadata.RcsbAccessionInfo.InitialReleaseDate.path,
    contentType: "date",
    chartType: ChartType.histogram,
    chartConfig: {
        tickIncrement: {
            origin: 1980,
            increment: 10
        },
        tickFormat:{
            domAxis: (t: number|string)=>{
               return t.toString().replace(",","")
            }
        },
        histogramBinIncrement: 1,
        domainMinValue: 1970,
        domainMaxValue: new Date().getFullYear()+2,
        axisLabel: "Year",
        chartDisplayConfig: {
            constHeight: 225
        },
        tooltipText: (d: ChartDataValueInterface<GroupChartMap.ChartObjectIdType>)=>{
            return `Release ${d.x as number - 0.5} - ${d.x as number + 0.5}`;
        }
    },
    facet: {
        name: "RELEASE_DATE_FACET",
        aggregation_type: AggregationType.DateHistogram,
        attribute: RcsbSearchMetadata.RcsbAccessionInfo.InitialReleaseDate.path,
        interval: "year",
        min_interval_population: 1
    }
};

export const SCOP_FACET: FacetMemberInterface = {
    id: "scop_class",
    title: "SCOP/SCOPe Domain",
    attributeName: "SCOP_FACET",
    attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path,
    contentType: "string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 10
    },
    facet: {
        filter: {
            type: Type.Terminal,
            service: Service.Text,
            parameters: {
                operator: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.Type.operator.ExactMatch,
                attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.Type.path,
                value: 'SCOP'
            }
        },
        facets: [{
            filter: {
                type: Type.Terminal,
                service: Service.Text,
                parameters: {
                    operator: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Depth.operator.Equals,
                    value: 5,
                    attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Depth.path
                }
            },
            facets: [{
                name: "SCOP_FACET",
                min_interval_population: 1,
                attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path,
                aggregation_type: AggregationType.Terms
            }]
        }]
    }
};

export const CATH_FACET: FacetMemberInterface = {
    id: "cath_class",
    title: "CATH Domain",
    attributeName: "CATH_FACET",
    attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path,
    contentType: "string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 10
    },
    facet: {
        filter: {
            type: Type.Terminal,
            service: Service.Text,
            parameters: {
                operator: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.Type.operator.ExactMatch,
                attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.Type.path,
                value: 'CATH'
            }
        },
        facets: [{
            filter: {
                type: Type.Terminal,
                service: Service.Text,
                parameters: {
                    operator: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Depth.operator.Equals,
                    value: 4,
                    attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Depth.path
                }
            },
            facets: [{
                name: "CATH_FACET",
                min_interval_population: 1,
                attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path,
                aggregation_type: AggregationType.Terms
            }]
        }]
    }
};

export const ECOD_FACET: FacetMemberInterface = {
    id: "ecod_class",
    title: "ECOD Domain",
    attributeName: "ECOD_FACET",
    attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path,
    contentType: "string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 10
    },
    facet: {
        filter: {
            type: Type.Terminal,
            service: Service.Text,
            parameters: {
                operator: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.Type.operator.ExactMatch,
                attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.Type.path,
                value: 'ECOD'
            }
        },
        facets: [{
            filter: {
                type: Type.Terminal,
                service: Service.Text,
                parameters: {
                    operator: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Depth.operator.Equals,
                    value: 4,
                    attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Depth.path
                }
            },
            facets: [{
                name: "ECOD_FACET",
                min_interval_population: 1,
                attribute: RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path,
                aggregation_type: AggregationType.Terms
            }]
        }]
    }
};

export const LIGAND_FACET: FacetMemberInterface = {
    id: "ligands",
    title: "Small Molecules",
    attributeName: "LIGAND_FACET",
    attribute: RcsbSearchMetadata.RcsbNonpolymerEntityInstanceContainerIdentifiers.CompId.path,
    contentType: "string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 20
    },
    facet: {
        name: "LIGAND_FACET",
        aggregation_type: AggregationType.Terms,
        attribute: RcsbSearchMetadata.RcsbNonpolymerEntityInstanceContainerIdentifiers.CompId.path,
        min_interval_population: 1
    }
}

export const LIGAND_OF_INTEREST_FACET: FacetMemberInterface = {
    id: "ligands",
    title: "Ligands of Interest",
    attributeName: "LIGAND_OF_INTEREST_FACET",
    attribute: RcsbSearchMetadata.RcsbNonpolymerEntityInstanceContainerIdentifiers.CompId.path,
    contentType: "string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 20
    },
    facet: {
        filter: {
            type: Type.Terminal,
            service: Service.Text,
            parameters: {
                attribute: RcsbSearchMetadata.RcsbNonpolymerEntityAnnotation.Type.path,
                operator: RcsbSearchMetadata.RcsbNonpolymerEntityAnnotation.Type.operator.ExactMatch,
                value: "SUBJECT_OF_INVESTIGATION"
            }
        },
        facets: [{
            name: "LIGAND_OF_INTEREST_FACET",
            aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.RcsbNonpolymerEntityAnnotation.CompId.path,
            min_interval_population: 1
        }]
    }
}

export const ORGANISM_FACET: FacetMemberInterface = {
    id: "organism",
    title: "Organism",
    attributeName: "ORGANISM_FACET",
    attribute: RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiScientificName.path,
    contentType: "string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 9
    },
    facet: {
        name: "ORGANISM_FACET",
        aggregation_type: AggregationType.Terms,
        attribute: RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiScientificName.path,
        min_interval_population: 1
    }
};

export const TAXONOMY_FACET: FacetMemberInterface = {
    id: "taxonomy",
    title: "Taxonomy",
    attributeName: "TAXONOMY_FACET",
    attribute: RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiParentScientificName.path,
    contentType: "string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 5
    },
    facet: {
        name: "TAXONOMY_FACET",
        aggregation_type: AggregationType.Terms,
        attribute: RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiParentScientificName.path,
        min_interval_population: 1
    }
};

export const PFAM_FACET: FacetMemberInterface = {
    id: "Pfam",
    title: "PFAM Domain",
    attributeName: "PFAM_FACET",
    attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Name.path,
    contentType: "string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 10
    },
    facet: {
        filter: {
            type: Type.Terminal,
            service: Service.Text,
            parameters: {
                operator: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.operator.ExactMatch,
                attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.path,
                value: 'Pfam'
            }
        },
        facets: [{
            name: "PFAM_FACET",
            min_interval_population: 1,
            attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Name.path,
            aggregation_type: AggregationType.Terms
        }]
    }
};

export const ENTITY_NAME_FACET: FacetMemberInterface = {
    id: "entiy_names",
    title: undefined,
    attributeName: "ENTITY_NAME_FACET",
    attribute: RcsbSearchMetadata.RcsbPolymerEntity.RcsbPolymerNameCombined.Names.path,
    contentType: "string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 5
    },
    facet: {
        name: "ENTITY_NAME_FACET",
        aggregation_type: AggregationType.Terms,
        attribute: RcsbSearchMetadata.RcsbPolymerEntity.RcsbPolymerNameCombined.Names.path,
        min_interval_population: 1
    }
}

export const CHEM_COMP_FACET: FacetMemberInterface = {
    id: "chemp_comp",
    title: "Chemical Component",
    attributeName: "CHEM_COMP_FACET",
    attribute: RcsbSearchMetadata.ChemComp.Type.path,
    contentType: "string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 5
    },
    facet: {
        name: "CHEM_COMP_FACET",
        aggregation_type: AggregationType.Terms,
        attribute: RcsbSearchMetadata.ChemComp.Type.path,
        min_interval_population: 1
    }
}

export const ENZYME_CLASS_FACET: FacetMemberInterface = {
    id: "enzyme_class",
    title: "Enzyme Classification",
    attributeName: "ENZYME_CLASS_FACET",
    attribute: RcsbSearchMetadata.RcsbPolymerEntity.RcsbEcLineage.Name.path,
    contentType: "string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 10
    },
    facet: {
        filter: {
            type: Type.Terminal,
            service: Service.Text,
            parameters: {
                operator: RcsbSearchMetadata.RcsbPolymerEntity.RcsbEcLineage.Depth.operator.GreaterOrEqual,
                attribute: RcsbSearchMetadata.RcsbPolymerEntity.RcsbEcLineage.Depth.path,
                value: 3
            }
        },
        facets: [{
            name: "ENZYME_CLASS_FACET",
            aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.RcsbPolymerEntity.RcsbEcLineage.Name.path,
            min_interval_population: 1
        }]
    }
}

export const GO_FUNCTION_FACET: FacetMemberInterface = {
    id: "go_function_class",
    title: "GO Molecular Function",
    attributeName: "GO_FUNCTION_FACET",
    attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Name.path,
    contentType: "string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 10
    },
    facet: {
        filter: {
            type: Type.Terminal,
            service: Service.Text,
            parameters: {
                operator: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.operator.ExactMatch,
                attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.path,
                value: "GO"
            }
        },
        facets: [{
            name: "GO_FUNCTION_FACET",
            aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Name.path,
            max_num_intervals: 1000,
            min_interval_population: 1,
            facets: [{
                filter: {
                    type: Type.Terminal,
                    service: Service.Text,
                    parameters: {
                        operator: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.operator.ExactMatch,
                        attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.AnnotationLineage.Name.path,
                        value: "molecular_function"
                    }
                },
                facets: [{
                    name:`GO_FUNCTION_FACET/${RcsbSearchMetadata.RcsbPolymerEntityAnnotation.AnnotationLineage.Name.path}`,
                    aggregation_type: AggregationType.Terms,
                    min_interval_population: 1,
                    attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.AnnotationLineage.Name.path
                }]
            }]
        }]
    }
}

export const GO_PROCESS_FACET: FacetMemberInterface = {
    id: "go_process_class",
    title: "GO Biological Process",
    attributeName: "GO_PROCESS_FACET",
    attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Name.path,
    contentType: "string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 10
    },
    facet: {
        filter: {
            type: Type.Terminal,
            service: Service.Text,
            parameters: {
                operator: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.operator.ExactMatch,
                attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.path,
                value: "GO"
            }
        },
        facets: [{
            name: "GO_PROCESS_FACET",
            aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Name.path,
            max_num_intervals: 1000,
            min_interval_population: 1,
            facets: [{
                filter: {
                    type: Type.Terminal,
                    service: Service.Text,
                    parameters: {
                        operator: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.operator.ExactMatch,
                        attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.AnnotationLineage.Name.path,
                        value: "biological_process"
                    }
                },
                facets: [{
                    name:`GO_PROCESS_FACET/${RcsbSearchMetadata.RcsbPolymerEntityAnnotation.AnnotationLineage.Name.path}`,
                    aggregation_type: AggregationType.Terms,
                    min_interval_population: 1,
                    attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.AnnotationLineage.Name.path
                }]
            }]
        }]
    }
}

export const GO_COMPONENT_FACET: FacetMemberInterface = {
    id: "go_component_class",
    title: "GO Cellular Component",
    attributeName: "GO_COMPONENT_FACET",
    attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Name.path,
    contentType: "string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 10
    },
    facet: {
        filter: {
            type: Type.Terminal,
            service: Service.Text,
            parameters: {
                operator: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.operator.ExactMatch,
                attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.path,
                value: "GO"
            }
        },
        facets: [{
            name: "GO_COMPONENT_FACET",
            aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Name.path,
            max_num_intervals: 1000,
            min_interval_population: 1,
            facets: [{
                filter: {
                    type: Type.Terminal,
                    service: Service.Text,
                    parameters: {
                        operator: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.operator.ExactMatch,
                        attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.AnnotationLineage.Name.path,
                        value: "cellular_component"
                    }
                },
                facets: [{
                    name:`GO_COMPONENT_FACET/${RcsbSearchMetadata.RcsbPolymerEntityAnnotation.AnnotationLineage.Name.path}`,
                    aggregation_type: AggregationType.Terms,
                    min_interval_population: 1,
                    attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.AnnotationLineage.Name.path
                }]
            }]
        }]
    }
}

export const DISEASE_FACET: FacetMemberInterface = {
    id: "disease",
    title: "Disease Association",
    attributeName: "DISEASE_FACET",
    attribute: RcsbSearchMetadata.RcsbUniprotAnnotation.Name.path,
    contentType: "string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 10
    },
    facet:{
        filter: {
            type: Type.Terminal,
            service: Service.Text,
            parameters: {
                operator: RcsbSearchMetadata.RcsbUniprotAnnotation.Type.operator.ExactMatch,
                attribute: RcsbSearchMetadata.RcsbUniprotAnnotation.Type.path,
                value: "disease"
            }
        },
        facets:[{
            name: "DISEASE_FACET",
            aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.RcsbUniprotAnnotation.Name.path
        }]
    }
};

export const INTERPRO_FACET: FacetMemberInterface = {
    id: "InterPro",
    title: "InterPro Domain",
    attributeName: "INTERPRO_FACET",
    attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Name.path,
    contentType: "string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 10
    },
    facet: {
        filter: {
            type: Type.Terminal,
            service: Service.Text,
            parameters: {
                operator: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.operator.ExactMatch,
                attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Type.path,
                value: 'InterPro'
            }
        },
        facets: [{
            name: "INTERPRO_FACET",
            min_interval_population: 1,
            attribute: RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Name.path,
            aggregation_type: AggregationType.Terms
        }]
    }
};

export const PHENOTYPE_FACET: FacetMemberInterface = {
    id: "phenotype",
    title: "Phenotype Association",
    attributeName: "PHENOTYPE_FACET",
    attribute: RcsbSearchMetadata.RcsbUniprotAnnotation.Name.path,
    contentType: "string",
    chartType: ChartType.barplot,
    chartConfig: {
        mostPopulatedGroups: 10
    },
    facet:{
        filter: {
            type: Type.Terminal,
            service: Service.Text,
            parameters: {
                operator: RcsbSearchMetadata.RcsbUniprotAnnotation.Type.operator.ExactMatch,
                attribute: RcsbSearchMetadata.RcsbUniprotAnnotation.Type.path,
                value: "phenotype"
            }
        },
        facets:[{
            name: "PHENOTYPE_FACET",
            aggregation_type: AggregationType.Terms,
            attribute: RcsbSearchMetadata.RcsbUniprotAnnotation.Name.path
        }]
    }
};

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
    LIGAND_OF_INTEREST_FACET,
    METHODOLOGY_FACET,
    CHIMERIC_FACET: TAXONOMY_COUNT_FACET,
    DISEASE_FACET,
    INTERPRO_FACET,
    PHENOTYPE_FACET
};
