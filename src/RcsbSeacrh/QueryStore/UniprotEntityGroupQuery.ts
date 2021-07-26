import {SearchQueryType} from "../SearchRequestProperty";
import {LogicalOperator, Service, Type} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchEnums";
import {RcsbSearchMetadata} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchMetadata";

export function uniprotEntityGroupQuery(acc:string): SearchQueryType {
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
                    value: acc
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