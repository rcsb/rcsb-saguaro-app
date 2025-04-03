import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/lib/RcsbDw/Types/DwEnums";
import {ReturnType} from "@rcsb/rcsb-api-tools/lib/RcsbSearch/Types/SearchEnums";

interface GroupProvenanceToReturnType extends Record<GroupProvenanceId, ReturnType>{

}

export const groupProvenanceToReturnType: GroupProvenanceToReturnType = {
   [GroupProvenanceId.ProvenanceMatchingDepositGroupId]: ReturnType.Entry,
   [GroupProvenanceId.ProvenanceMatchingUniprotAccession]: ReturnType.PolymerEntity,
   [GroupProvenanceId.ProvenanceSequenceIdentity]: ReturnType.PolymerEntity,
   [GroupProvenanceId.ProvenanceMatchingChemicalComponentId]: ReturnType.NonPolymerEntity
};
