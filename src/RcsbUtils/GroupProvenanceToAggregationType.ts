import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {GroupReference} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";

export enum ExtendedGroupReference {
   MatchingDepositionGroupId = "matching_deposit_group_id"
}

export type GroupAggregationUnifiedType = GroupReference | ExtendedGroupReference;

interface GroupProvenanceToAggregationType extends Record<GroupProvenanceId, GroupAggregationUnifiedType>{

}

export const groupProvenanceToAggregationType: GroupProvenanceToAggregationType = {
   [GroupProvenanceId.ProvenanceMatchingDepositGroupId]: ExtendedGroupReference.MatchingDepositionGroupId,
   [GroupProvenanceId.ProvenanceMatchingUniprotAccession]: GroupReference.MatchingUniprotAccession,
   [GroupProvenanceId.ProvenanceSequenceIdentity]: GroupReference.SequenceIdentity,
};


interface GroupProvenanceToReferenceInterface extends Record<GroupProvenanceId, GroupReference|undefined>{

}

export const groupProvenanceToReference: GroupProvenanceToReferenceInterface = {
   [GroupProvenanceId.ProvenanceMatchingUniprotAccession]: GroupReference.MatchingUniprotAccession,
   [GroupProvenanceId.ProvenanceSequenceIdentity]: GroupReference.SequenceIdentity,
   [GroupProvenanceId.ProvenanceMatchingDepositGroupId]: undefined
};