import {SearchQueryType} from "../SearchRequestProperty";
import {LogicalOperator, Service, Type} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchEnums";
import {RcsbSearchMetadata} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchMetadata";
import {SearchQuery} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchQueryInterface";

export function searchGroupQuery(groupId:string): SearchQueryType {
    return {
        type: Type.Group,
            logical_operator: LogicalOperator.And,
            nodes: [
            {
                type: Type.Terminal,
                service: Service.Text,
                parameters: {
                    attribute: RcsbSearchMetadata.RcsbPolymerEntityContainerIdentifiers.ReferenceSequenceIdentifiers.DatabaseAccession.path,
                    negation: false,
                    operator: RcsbSearchMetadata.RcsbPolymerEntityContainerIdentifiers.ReferenceSequenceIdentifiers.DatabaseAccession.operator.ExactMatch,
                    value: groupId
                }
            },
            {
                type: Type.Terminal,
                service: Service.Text,
                parameters: {
                    attribute: RcsbSearchMetadata.RcsbPolymerEntityContainerIdentifiers.ReferenceSequenceIdentifiers.DatabaseName.path,
                    operator: RcsbSearchMetadata.RcsbPolymerEntityContainerIdentifiers.ReferenceSequenceIdentifiers.DatabaseName.operator.ExactMatch,
                    value: "UniProt"
                }
            }
        ]
    }
}

export function addGroupNodeToSearchQuery(groupId: string, searchQuery: SearchQuery): SearchQueryType {
    return {
        type: Type.Group,
        logical_operator: LogicalOperator.And,
        nodes: [
            searchGroupQuery(groupId),
            searchQuery.query
        ]
    }
}