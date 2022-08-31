import {buildGroupFv} from "../RcsbFvWeb/RcsbFvBuilder";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";

buildGroupFv("pfv",GroupProvenanceId.ProvenanceSequenceIdentity, "1_30");