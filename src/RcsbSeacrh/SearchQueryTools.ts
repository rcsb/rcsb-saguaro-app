import {SearchQueryType} from "./SearchRequestProperty";
import {
    LogicalOperator,
    Operator, RelevanceScoreRankingOption, ReturnType,
    ScoringStrategy,
    Service, SortDirection,
    Type
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import {
    SearchQuery,
    AttributeTextQueryParameters, GroupNode
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {FacetStoreInterface} from "./FacetStore/FacetStoreInterface";
import {cloneDeep} from 'lodash';
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {depositionGroupFacetStore} from "./FacetStore/DepositionGroupFacetStore";
import {sequenceGroupFacetStore} from "./FacetStore/SequenceGroupFacetStore";
import {uniprotGroupFacetStore} from "./FacetStore/UniprotGroupFacetStore";
import {SearchRequestModule, SearchRequestModule as SRM} from "./SearchRequestModule";

export namespace SearchQueryTools {

    import RefinementType = SearchRequestModule.RefinementType;

    export function searchGroupQuery(groupProvenance: GroupProvenanceId, groupId: string, service?: Service): SearchQueryType {
        const groupSearchAttr: GroupSearchAttribute = getSearchAttribute(groupProvenance);
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

    export function addGroupNodeToSearchQuery(groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery: SearchQueryType, service?: Service): SearchQueryType {
        return addNodeToSearchQuery(searchGroupQuery(groupProvenanceId, groupId, service), searchQuery);
    }

    export function buildAttributeSearchQuery(attribute: string, value: AttributeTextQueryParameters['value'], operator: Operator, searchQuery: SearchQueryType, returnType: ReturnType, service: Service.Text | Service.TextChem, negation: boolean = false): SearchQuery {
        return {
            query: addNewNodeToAttributeSearchQuery(attribute, value, operator, searchQuery, service, negation),
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

    export function addNodeToSearchRequest(searchQuery: SearchQuery, node:SearchQueryType): SearchQuery {
       return SRM.addNode(searchQuery, node);
    }

    export function addGroupIdToSearchRequest(searchQuery: SearchQuery, groupProvenanceId: GroupProvenanceId, groupId: string): SearchQuery {
        console.log(SRM.addNode(searchQuery, searchGroupQuery(groupProvenanceId, groupId)));
        return SRM.addNode(searchQuery, searchGroupQuery(groupProvenanceId, groupId));
    }

    export function addRefinements(searchQuery: SearchQuery, refinement: RefinementType|RefinementType[]): SearchQuery {
        return SRM.addRefinements(searchQuery, refinement);
    }

    export function buildNodeSearchQuery(node: SearchQueryType, searchQuery: SearchQueryType, returnType: ReturnType, logicalOperator = LogicalOperator.And): SearchQuery {
        return {
            query: {
                type: Type.Group,
                logical_operator: logicalOperator,
                nodes: [
                    searchQuery,
                    node
                ]
            },
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

    export function buildSearchQuery(searchQuery: SearchQueryType, returnType: ReturnType, logicalOperator = LogicalOperator.And): SearchQuery {
        return {
            query: searchQuery,
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

    export function addNewNodeToAttributeSearchQuery(attribute: string, value: AttributeTextQueryParameters['value'], operator: Operator, searchQuery: SearchQueryType, service: Service.Text | Service.TextChem, negation: boolean = false): SearchQueryType {
        return addNodeToSearchQuery(searchAttributeQuery(attribute, value, operator, service, negation), searchQuery);
    }

    export function searchAttributeQuery(attribute: string, value: AttributeTextQueryParameters['value'], operator: Operator, service: Service.Text | Service.TextChem, negation: boolean = false): SearchQueryType {
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

    export function addNodeToSearchQuery(node: SearchQueryType, searchQuery: SearchQueryType, logicalOperator = LogicalOperator.And): SearchQueryType {
        if (searchQuery.type === Type.Group && searchQuery.logical_operator === logicalOperator) {
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

    export function getFacetStoreFromGroupProvenance(groupProvenanceId: GroupProvenanceId): FacetStoreInterface {
        switch (groupProvenanceId) {
            case GroupProvenanceId.ProvenanceMatchingDepositGroupId:
                return depositionGroupFacetStore;
            case GroupProvenanceId.ProvenanceSequenceIdentity:
                return sequenceGroupFacetStore;
            case GroupProvenanceId.ProvenanceMatchingUniprotAccession:
                return uniprotGroupFacetStore;
        }
    }

    type GroupSearchAttribute =
        (typeof RcsbSearchMetadata.RcsbEntryGroupMembership.GroupId)
        | (typeof RcsbSearchMetadata.RcsbPolymerEntityGroupMembership.GroupId);

    function getSearchAttribute(groupProvenanceId: GroupProvenanceId): GroupSearchAttribute {
        switch (groupProvenanceId) {
            case GroupProvenanceId.ProvenanceMatchingDepositGroupId:
                return RcsbSearchMetadata.RcsbEntryGroupMembership.GroupId;
            case GroupProvenanceId.ProvenanceSequenceIdentity:
                return RcsbSearchMetadata.RcsbPolymerEntityGroupMembership.GroupId;
            case GroupProvenanceId.ProvenanceMatchingUniprotAccession:
                return RcsbSearchMetadata.RcsbPolymerEntityGroupMembership.GroupId;
        }
    }
}

