import {SearchQueryType} from "../SearchRequestProperty";
import {
    LogicalOperator,
    Operator, RelevanceScoreRankingOption, ReturnType,
    ScoringStrategy,
    Service, SortDirection,
    Type
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import {SearchQuery, Range, GroupNode} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {GroupReference} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {entityGroupFacetStore} from "../FacetStore/EntityGroupFacetStore";
import {FacetStoreInterface} from "../FacetStore/FacetStoreInterface";
import {entryGroupFacetStore} from "../FacetStore/EntryGroupFacetStore";
import {GroupAggregationUnifiedType} from "../../RcsbUtils/GroupProvenanceToAggregationType";
import cloneDeep from 'lodash/cloneDeep';

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

export function addGroupNodeToSearchQuery(groupAggregationType: GroupAggregationUnifiedType, groupId: string, searchQuery: SearchQuery, service?: Service): SearchQueryType {
    return addNodeToSearchQuery(searchGroupQuery(groupAggregationType, groupId, service),searchQuery.query);
}

export function buildAttributeSearchQuery(attribute: string, value: string|number|Range, operator: Operator, searchQuery: SearchQueryType, returnType:ReturnType, service: Service.Text|Service.TextChem, negation: boolean = false): SearchQuery {
    return {
        query: addNewNodeToAttributeSearchQuery(attribute,value,operator,searchQuery,service,negation),
        return_type: returnType,
        request_options: {
            pager: {
                start: 0,
                rows: 25
            },
            scoring_strategy: ScoringStrategy.Combined,
            sort: [
                {
                    sort_by: RelevanceScoreRankingOption.Score,
                    direction: SortDirection.Desc
                }
            ]
        }
    }
}

export function addNewNodeToAttributeSearchQuery(attribute: string, value: string|number|Range, operator: Operator, searchQuery: SearchQueryType, service: Service.Text|Service.TextChem, negation: boolean = false): SearchQueryType {
    return addNodeToSearchQuery(searchAttributeQuery(attribute, value, operator, service,negation),searchQuery);
}

export function searchAttributeQuery(attribute: string, value: string|number|Range, operator: Operator, service: Service.Text|Service.TextChem, negation: boolean = false): SearchQueryType {
    return {
        type: Type.Terminal,
        service: service,
        parameters: {
            attribute: attribute,
            negation: negation,
            operator: operator as any,
            value: value
        }
    }
}

export function getFacetStoreFromGroupType(groupAggregationType: GroupAggregationUnifiedType): FacetStoreInterface {
    return (groupAggregationType === GroupReference.MatchingUniprotAccession || groupAggregationType === GroupReference.SequenceIdentity) ? entityGroupFacetStore : entryGroupFacetStore;
}

function addNodeToSearchQuery(node:SearchQueryType, searchQuery: SearchQueryType, logicalOperator = LogicalOperator.And): SearchQueryType{
    if(searchQuery.type === Type.Group && searchQuery.logical_operator === logicalOperator) {
        const query: SearchQueryType = cloneDeep(searchQuery);
        query.nodes.push(node);
        return query;
    }
    return {
        type: Type.Group,
        logical_operator: logicalOperator,
        nodes: [
            searchQuery,
            node
        ]
    }
}

type GroupSearchAttribute = (typeof RcsbSearchMetadata.RcsbEntryGroupMembership.GroupId) | (typeof RcsbSearchMetadata.RcsbPolymerEntityGroupMembership.GroupId);
function getSearchAttribute(groupAggregationType: GroupAggregationUnifiedType): GroupSearchAttribute {
    return (groupAggregationType === GroupReference.MatchingUniprotAccession || groupAggregationType === GroupReference.SequenceIdentity) ?
        RcsbSearchMetadata.RcsbPolymerEntityGroupMembership.GroupId :
        RcsbSearchMetadata.RcsbEntryGroupMembership.GroupId;
}

