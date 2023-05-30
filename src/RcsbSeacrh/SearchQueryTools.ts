import {
    LogicalOperator,
    RelevanceScoreRankingOption,
    ReturnType,
    ScoringStrategy,
    Service,
    SortDirection,
    Type
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {RcsbSearchAttributeType, RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import {
    AttributeTextQueryParameters,
    ResultsContentType,
    SearchQuery
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {FacetStoreInterface} from "./FacetStore/FacetStoreInterface";
import {cloneDeep} from 'lodash';
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/build/RcsbDw/Types/DwEnums";
import {depositionGroupFacetStore} from "./FacetStore/DepositionGroupFacetStore";
import {sequenceGroupFacetStore} from "./FacetStore/SequenceGroupFacetStore";
import {uniprotGroupFacetStore} from "./FacetStore/UniprotGroupFacetStore";
import {SearchQueryType} from "@rcsb/rcsb-search-tools/lib/SearchQueryTools/SearchQueryInterfaces";
import {
    buildAttributeQuery,
    buildRequestFromCombinedSearchQuery, buildRequestFromSearchQuery
} from "@rcsb/rcsb-search-tools/lib/SearchQueryTools/SearchQueryTools";

export namespace SearchQueryTools {

    export function searchGroupQuery(groupProvenance: GroupProvenanceId, groupId: string, service?: Service.Text | Service.TextChem): SearchQueryType {
        const groupSearchAttr: GroupSearchAttribute = getSearchAttribute(groupProvenance);
        return buildAttributeQuery({
            attribute: groupSearchAttr.path,
            value: groupId,
            operator: groupSearchAttr.operator.ExactMatch,
            service:  service ?? Service.Text
        });
    }

    export function addGroupNodeToSearchQuery(groupProvenanceId: GroupProvenanceId, groupId: string, searchQuery: SearchQueryType, service?: Service.Text | Service.TextChem): SearchQueryType {
        return addNodeToSearchQuery(searchGroupQuery(groupProvenanceId, groupId, service), searchQuery);
    }

    export function buildNodeSearchQuery(node: SearchQueryType, searchQuery: SearchQueryType, returnType: ReturnType, resultsContentType:ResultsContentType, logicalOperator = LogicalOperator.And): SearchQuery {
        return buildRequestFromCombinedSearchQuery(
            searchQuery,
            node,
            returnType,
            logicalOperator,
            {
                paginate: {
                    start: 0,
                    rows: 25
                },
                scoring_strategy: ScoringStrategy.Combined,
                sort: [
                    {
                        sort_by: RelevanceScoreRankingOption.Score,
                        direction: SortDirection.Desc
                    }
                ],
                results_content_type: resultsContentType
            }
        );
    }

    export function buildSearchQuery(searchQuery: SearchQueryType, returnType: ReturnType): SearchQuery {
        return buildRequestFromSearchQuery(
            searchQuery,
            returnType,
            {
                paginate: {
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
            });
    }

    export function addNewNodeToAttributeSearchQuery(attribute: RcsbSearchAttributeType, value: AttributeTextQueryParameters['value'], operator: AttributeTextQueryParameters["operator"], searchQuery: SearchQueryType, service: Service.Text | Service.TextChem, negation: boolean = false): SearchQueryType {
        return addNodeToSearchQuery(searchAttributeQuery(attribute, value, operator, service, negation), searchQuery);
    }

    export function searchAttributeQuery(attribute: RcsbSearchAttributeType, value: AttributeTextQueryParameters['value'], operator: AttributeTextQueryParameters["operator"], service: Service.Text | Service.TextChem, negation: boolean = false): SearchQueryType {
        return buildAttributeQuery({
            attribute,
            value,
            operator,
            service,
            negation
        });
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

    export function searchContentType(searchQuery?: SearchQuery): ResultsContentType{
        return searchQuery?.request_options?.results_content_type ?? ["computational","experimental"];
    }

    type GroupSearchAttribute =
        (typeof RcsbSearchMetadata.RcsbEntryGroupMembership.GroupId) |
        (typeof RcsbSearchMetadata.RcsbPolymerEntityGroupMembership.GroupId);

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

