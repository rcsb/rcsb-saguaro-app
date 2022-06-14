import {buildGroup} from "../RcsbGroupWeb/RcsbGroupBuilder";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";

buildGroup("pfv", GroupProvenanceId.ProvenanceSequenceIdentity, "5_30", undefined, ["RESOLUTION_FACET"]).then((m)=>{
    console.log(m);
});