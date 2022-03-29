import {
    ReturnType,
    Service
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {FacetMemberInterface} from "./FacetMemberInterface";
import {FacetStoreInterface} from "./FacetStoreInterface";

import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import {
    CATH_FACET, CHEM_COMP_FACET,
    RELEASE_DATE_FACET, ECOD_FACET, ENTITY_NAME_FACET,
    EXPERIMENTAL_METHOD_FACET, LIGAND_FACET, ORGANISM_FACET, PFAM_FACET,
    RESOLUTION_FACET,
    SCOP_FACET, TAXONOMY_FACET
} from "./SingleFacets";
import {cloneDeep} from "lodash";

class EntityGranularitySearchFacetStore implements FacetStoreInterface{
    private readonly entryFacet: FacetMemberInterface[] = [cloneDeep<FacetMemberInterface>(EXPERIMENTAL_METHOD_FACET),cloneDeep<FacetMemberInterface>(RESOLUTION_FACET),cloneDeep<FacetMemberInterface>(RELEASE_DATE_FACET)];
    private readonly instanceFacet: FacetMemberInterface[] = [cloneDeep<FacetMemberInterface>(SCOP_FACET),cloneDeep<FacetMemberInterface>(CATH_FACET),cloneDeep<FacetMemberInterface>(ECOD_FACET),cloneDeep<FacetMemberInterface>(LIGAND_FACET)];
    private readonly entityFacet: FacetMemberInterface[] = [cloneDeep<FacetMemberInterface>(ORGANISM_FACET), cloneDeep<FacetMemberInterface>(TAXONOMY_FACET), cloneDeep<FacetMemberInterface>(PFAM_FACET), cloneDeep<FacetMemberInterface>(ENTITY_NAME_FACET)];
    private readonly nonPolymerFacet: FacetMemberInterface[] = [cloneDeep<FacetMemberInterface>(CHEM_COMP_FACET)];

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

    readonly facetLayoutGrid: string[] = [
        RcsbSearchMetadata.RcsbEntryInfo.DiffrnResolutionHigh.Value.path,
        RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiScientificName.path, RcsbSearchMetadata.RcsbEntitySourceOrganism.NcbiParentScientificName.path,
        RcsbSearchMetadata.Exptl.Method.path, RcsbSearchMetadata.RcsbPolymerInstanceAnnotation.AnnotationLineage.Name.path
    ];

    readonly returnType: ReturnType = ReturnType.PolymerEntity;
}

export const entityGranularityGroupFacetStore: EntityGranularitySearchFacetStore = new EntityGranularitySearchFacetStore();