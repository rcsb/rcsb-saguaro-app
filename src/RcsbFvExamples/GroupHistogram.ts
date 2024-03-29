import {buildGroup, buildGroupContent} from "../RcsbGroupWeb/RcsbGroupBuilder";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";

const groupId = "2_30";

buildGroupContent("select", GroupProvenanceId.ProvenanceSequenceIdentity, groupId);

// buildGroupMembers("carousel", GroupProvenanceId.ProvenanceSequenceIdentity, groupId, 1, 1)

buildGroup("pfv", GroupProvenanceId.ProvenanceSequenceIdentity, groupId, undefined, ["TAXONOMY_COUNT_FACET", "DISEASE_FACET", "INTERPRO_FACET", "PHENOTYPE_FACET"]).then((m)=>{
});

buildGroup("pfv_2", GroupProvenanceId.ProvenanceSequenceIdentity, groupId, undefined, ["RESOLUTION_FACET","EXPERIMENTAL_METHOD_FACET"]).then((m)=>{
});

buildGroup("pfv_3", GroupProvenanceId.ProvenanceSequenceIdentity, groupId, undefined, ["CATH_FACET","RESOLUTION_FACET"]).then((m)=>{
});

//buildGroup("pfv_2", GroupProvenanceId.ProvenanceSequenceIdentity, "5_30", undefined, ["GO_FUNCTION_FACET"]).then((m)=>{
//});