import {SearchQueryType} from "../SearchRequestProperty";
import {LogicalOperator, Service, Type} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {GroupReference} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {entityGroupFacetStore} from "../FacetStore/EntityGroupFacetStore";
import {FacetStoreInterface} from "../FacetStore/FacetStoreInterface";
import {entryGroupFacetStore} from "../FacetStore/EntryGroupFacetStore";
import {GroupAggregationUnifiedType} from "../../RcsbUtils/GroupProvenanceToAggregationType";

export function searchGroupQuery(groupGranularity: GroupAggregationUnifiedType, groupId:string, service?: Service): SearchQueryType {
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
function getSearchAttribute(groupAggregationType: GroupAggregationUnifiedType): GroupSearchAttribute {
   return (groupAggregationType === GroupReference.MatchingUniprotAccession || groupAggregationType === GroupReference.SequenceIdentity) ?
       RcsbSearchMetadata.RcsbPolymerEntityGroupMembership.GroupId :
       RcsbSearchMetadata.RcsbEntryGroupMembership.GroupId;
}

export function addGroupNodeToSearchQuery(groupAggregationType: GroupAggregationUnifiedType, groupId: string, searchQuery: SearchQuery, service?: Service): SearchQueryType {
    return {
        type: Type.Group,
        logical_operator: LogicalOperator.And,
        nodes: [
            searchGroupQuery(groupAggregationType, groupId, service),
            searchQuery.query
        ]
    }
}


export function getFacetStoreFromGroupType(groupAggregationType: GroupAggregationUnifiedType): FacetStoreInterface {
    return (groupAggregationType === GroupReference.MatchingUniprotAccession || groupAggregationType === GroupReference.SequenceIdentity) ? entityGroupFacetStore : entryGroupFacetStore;
}

