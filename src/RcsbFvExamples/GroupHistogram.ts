import {buildGroup, buildGroupContent, buildGroupMembers} from "../RcsbGroupWeb/RcsbGroupBuilder";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";

const groupId = "1507_30";

buildGroupContent("select", GroupProvenanceId.ProvenanceSequenceIdentity, groupId);

buildGroupMembers("selectBis", GroupProvenanceId.ProvenanceSequenceIdentity, groupId, 1, 1)


buildGroup("pfv", GroupProvenanceId.ProvenanceSequenceIdentity, groupId, undefined, ["ENTITY_NAME_FACET", "RELEASE_DATE_FACET", "METHODOLOGY_FACET"]).then((m)=>{
});

buildGroup("pfv_2", GroupProvenanceId.ProvenanceSequenceIdentity, groupId, undefined, ["RESOLUTION_FACET","EXPERIMENTAL_METHOD_FACET"]).then((m)=>{
});

buildGroup("pfv_3", GroupProvenanceId.ProvenanceSequenceIdentity, groupId, undefined, ["EXPERIMENTAL_METHOD_FACET","PFAM_FACET","GO_FUNCTION_FACET","GO_PROCESS_FACET","GO_COMPONENT_FACET"]).then((m)=>{
});

//buildGroup("pfv_2", GroupProvenanceId.ProvenanceSequenceIdentity, "5_30", undefined, ["GO_FUNCTION_FACET"]).then((m)=>{
//});