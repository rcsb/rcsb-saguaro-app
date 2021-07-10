import {SearchQueryType} from "../SearchRequestProperty";
import {LogicalOperator, Operator, Service, Type} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchEnums";
import {CorePolymerEntity} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Yosemite/CorePaths";

export function uniprotEntityGroupQuery(acc:string): SearchQueryType {
    return {
        type: Type.Group,
            logical_operator: LogicalOperator.And,
            nodes: [
            {
                type: Type.Terminal,
                service: Service.Text,
                parameters: {
                    attribute: CorePolymerEntity.RcsbPolymerEntityContainerIdentifiers.ReferenceSequenceIdentifiers.DatabaseAccession,
                    negation: false,
                    operator: Operator.ExactMatch,
                    value: acc
                }
            },
            {
                type: Type.Terminal,
                service: Service.Text,
                parameters: {
                    attribute: CorePolymerEntity.RcsbPolymerEntityContainerIdentifiers.ReferenceSequenceIdentifiers.DatabaseName,
                    operator: Operator.ExactMatch,
                    value: "UniProt"
                }
            }
        ]
    }
}