import {buildGroupFv} from "../RcsbFvWeb/RcsbFvBuilder";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {rcsbRequestCtxManager} from "../RcsbRequest/RcsbRequestContextManager";

rcsbRequestCtxManager.initializeBorregoClient({api:"https://clustrelax-dev.rcsb.org/graphql"});
buildGroupFv("pfv",GroupProvenanceId.ProvenanceSequenceIdentity, "9_30");