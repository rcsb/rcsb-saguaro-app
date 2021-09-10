import {SearchQueryType} from "../SearchRequestProperty";
import {LogicalOperator, Service, Type} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchEnums";
import {RcsbSearchMetadata} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchMetadata";
import {SearchQuery} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchQueryInterface";

export function searchGroupQuery(groupId:string, service?: Service): SearchQueryType {
    return {
        type: Type.Terminal,
        service: service ?? Service.Text,
        parameters: {
            attribute: RcsbSearchMetadata.RcsbPolymerEntityContainerIdentifiers.GroupIds.path,
            negation: false,
            operator: RcsbSearchMetadata.RcsbPolymerEntityContainerIdentifiers.GroupIds.operator.ExactMatch,
            value: groupId
        }
    }
}

export function addGroupNodeToSearchQuery(groupId: string, searchQuery: SearchQuery, service?: Service): SearchQueryType {
    return {
        type: Type.Group,
        logical_operator: LogicalOperator.And,
        nodes: [
            searchGroupQuery(groupId, service),
            searchQuery.query
        ]
    }
}