import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {GroupReference} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";

interface GroupProvenanceToReturnType extends Record<GroupProvenanceId, ReturnType>{

}

export const groupProvenanceToReturnType: GroupProvenanceToReturnType = {
   [GroupProvenanceId.ProvenanceMatchingDepositGroupId]: ReturnType.Entry,
   [GroupProvenanceId.ProvenanceMatchingUniprotAccession]: ReturnType.PolymerEntity,
   [GroupProvenanceId.ProvenanceSequenceIdentity]: ReturnType.PolymerEntity,
};
