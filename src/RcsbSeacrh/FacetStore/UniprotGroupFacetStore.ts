import {
    ReturnType,
    Service
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {FacetMemberInterface} from "./FacetMemberInterface";
import {FacetStoreInterface} from "./FacetStoreInterface";
import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import {
    CHEM_COMP_FACET,
    ENTITY_NAME_FACET,
    EXPERIMENTAL_METHOD_FACET,
    LIGAND_FACET,
    ORGANISM_FACET,
    PFAM_FACET,
    RELEASE_DATE_FACET,
    RESOLUTION_FACET,
    SCOP_FACET,
    TAXONOMY_FACET,
    CATH_FACET,
    ECOD_FACET,
    ENZYME_CLASS_FACET,
    GO_FUNCTION_FACET
} from "./SingleFacets";

class UniprotGroupFacetStore implements FacetStoreInterface{
    private readonly entryFacet: FacetMemberInterface[] = [EXPERIMENTAL_METHOD_FACET,RESOLUTION_FACET,RELEASE_DATE_FACET,ENZYME_CLASS_FACET];
    private readonly instanceFacet: FacetMemberInterface[] = [SCOP_FACET,CATH_FACET,ECOD_FACET,LIGAND_FACET];
    private readonly entityFacet: FacetMemberInterface[] = [ORGANISM_FACET, TAXONOMY_FACET, PFAM_FACET, ENTITY_NAME_FACET,GO_FUNCTION_FACET];
    private readonly nonPolymerFacet: FacetMemberInterface[] = [CHEM_COMP_FACET];

    getServices(): Service[] {
        return [Service.Text];
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
        [RcsbSearchMetadata.RcsbAccessionInfo.DepositDate.path],
        [RcsbSearchMetadata.RcsbEntryInfo.ResolutionCombined.path, RcsbSearchMetadata.Exptl.Method.path],
        [RcsbSearchMetadata.ChemComp.Type.path],
        [RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiScientificName.path, RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiParentScientificName.path],
        [RcsbSearchMetadata.RcsbPolymerEntityAnnotation.Name.path, RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path],
    ];

    readonly returnType: ReturnType = ReturnType.PolymerEntity;
}

export const uniprotGroupFacetStore: UniprotGroupFacetStore = new UniprotGroupFacetStore();