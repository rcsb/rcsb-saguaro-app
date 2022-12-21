import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";

type GroupProvenanceToReturnType = Record<GroupProvenanceId, ReturnType>

export const groupProvenanceToReturnType: GroupProvenanceToReturnType = {
   [GroupProvenanceId.ProvenanceMatchingDepositGroupId]: ReturnType.Entry,
   [GroupProvenanceId.ProvenanceMatchingUniprotAccession]: ReturnType.PolymerEntity,
   [GroupProvenanceId.ProvenanceSequenceIdentity]: ReturnType.PolymerEntity,
};
