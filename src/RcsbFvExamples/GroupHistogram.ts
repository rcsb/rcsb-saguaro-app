import {buildGroup} from "../RcsbGroupWeb/RcsbGroupBuilder";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {
    CATH_FACET, DISEASE_FACET,
    GO_COMPONENT_FACET,
    GO_FUNCTION_FACET,
    GO_PROCESS_FACET, INTERPRO_FACET, PHENOTYPE_FACET, RELEASE_DATE_FACET, RESOLUTION_FACET, TAXONOMY_COUNT_FACET
} from "../RcsbSeacrh/FacetStore/SingleFacets";

const groupId = "P01112";


// buildGroupContent("select", GroupProvenanceId.ProvenanceSequenceIdentity, groupId);

// buildGroupMembers("carousel", GroupProvenanceId.ProvenanceSequenceIdentity, groupId, 1, 1)

buildGroup("pfv", GroupProvenanceId.ProvenanceSequenceIdentity, groupId, undefined, [
    TAXONOMY_COUNT_FACET.attributeName,
    DISEASE_FACET.attributeName,
    INTERPRO_FACET.attributeName,
    PHENOTYPE_FACET.attributeName
]).then((m)=>{
});

// buildGroup("pfv_2", GroupProvenanceId.ProvenanceSequenceIdentity, groupId, undefined, ["RESOLUTION_FACET","EXPERIMENTAL_METHOD_FACET"]).then((m)=>{
// });

buildGroup("pfv_3", GroupProvenanceId.ProvenanceSequenceIdentity, groupId, undefined, [
    CATH_FACET.attributeName,
    RESOLUTION_FACET.attributeName,
    RELEASE_DATE_FACET.attributeName
]).then((m)=>{
});

buildGroup("pfv_2", GroupProvenanceId.ProvenanceSequenceIdentity, groupId, undefined, [
    GO_PROCESS_FACET.attributeName,
    GO_COMPONENT_FACET.attributeName,
    GO_FUNCTION_FACET.attributeName,
    PHENOTYPE_FACET.attributeName
]).then((m)=>{
});