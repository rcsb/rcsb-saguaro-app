import {buildGroup, buildGroupContent, buildGroupMembers} from "../RcsbGroupWeb/RcsbGroupBuilder";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";

//buildGroupContent("select", GroupProvenanceId.ProvenanceSequenceIdentity, "5_30");
//
//buildGroupMembers("selectBis", GroupProvenanceId.ProvenanceSequenceIdentity, "5_30", 1, 1)
//
//buildGroup("pfv", GroupProvenanceId.ProvenanceSequenceIdentity, "5_30", undefined, ["ENTITY_NAME_FACET", "RELEASE_DATE_FACET", "METHODOLOGY_FACET"]).then((m)=>{
//});

buildGroup("pfv_2", GroupProvenanceId.ProvenanceSequenceIdentity, "5_30", undefined, ["ENTITY_NAME_FACET", "RESOLUTION_FACET",  "RELEASE_DATE_FACET"]).then((m)=>{
});
//buildGroup("pfv_2", GroupProvenanceId.ProvenanceSequenceIdentity, "5_30", undefined, ["RESOLUTION_FACET","EXPERIMENTAL_METHOD_FACET"]).then((m)=>{
//});
//
//buildGroup("pfv_2", GroupProvenanceId.ProvenanceSequenceIdentity, "5_30", undefined, ["EXPERIMENTAL_METHOD_FACET","PFAM_FACET","GO_FUNCTION_FACET","GO_PROCESS_FACET","GO_COMPONENT_FACET"]).then((m)=>{
//});
//
//buildGroup("pfv_2", GroupProvenanceId.ProvenanceSequenceIdentity, "5_30", undefined, ["GO_FUNCTION_FACET"]).then((m)=>{
//});