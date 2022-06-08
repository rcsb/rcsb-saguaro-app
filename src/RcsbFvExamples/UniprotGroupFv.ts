import {buildGroupFv} from "../RcsbFvWeb/RcsbFvBuilder";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";

buildGroupFv("pfv",GroupProvenanceId.ProvenanceMatchingUniprotAccession, "P01112");