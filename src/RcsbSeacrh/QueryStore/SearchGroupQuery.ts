import {SearchQueryType} from "../SearchRequestProperty";
import {LogicalOperator, Service, Type} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {GroupReference} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {entityGroupFacetStore} from "../FacetStore/EntityGroupFacetStore";
import {FacetStoreInterface} from "../FacetStore/FacetStoreInterface";
import {entryGroupFacetStore} from "../FacetStore/EntryGroupFacetStore";

export function searchGroupQuery(groupGranularity: GroupGranularityType, groupId:string, service?: Service): SearchQueryType {
    const groupSearchAttr: GroupSearchAttribute = getSearchAttribute(groupGranularity);
    return {
        type: Type.Terminal,
        service: service ?? Service.Text,
        parameters: {
            attribute: groupSearchAttr.path,
            negation: false,
            operator: groupSearchAttr.operator.ExactMatch,
            value: groupId
        }
    }
}

type GroupSearchAttribute = (typeof RcsbSearchMetadata.RcsbEntryGroupMembership.GroupId) | (typeof RcsbSearchMetadata.RcsbPolymerEntityGroupMembership.GroupId);
function getSearchAttribute(groupGranularity: GroupGranularityType): GroupSearchAttribute {
   return (groupGranularity === GroupReference.MatchingUniprotAccession || groupGranularity === GroupReference.SequenceIdentity) ?
       RcsbSearchMetadata.RcsbPolymerEntityGroupMembership.GroupId :
       RcsbSearchMetadata.RcsbEntryGroupMembership.GroupId;
}

export function addGroupNodeToSearchQuery(groupGranularityType: GroupGranularityType, groupId: string, searchQuery: SearchQuery, service?: Service): SearchQueryType {
    return {
        type: Type.Group,
        logical_operator: LogicalOperator.And,
        nodes: [
            searchGroupQuery(groupGranularityType, groupId, service),
            searchQuery.query
        ]
    }
}

declare enum ExtendedGroupReference {
    MatchingDepositionGroupId = "matching_deposit_group_id"
}
export type GroupGranularityType = GroupReference | ExtendedGroupReference;
export function getFacetStoreFromGroupType(groupGranularity: GroupGranularityType): FacetStoreInterface {
    return (groupGranularity === GroupReference.MatchingUniprotAccession || groupGranularity === GroupReference.SequenceIdentity) ? entityGroupFacetStore : entryGroupFacetStore;
}

