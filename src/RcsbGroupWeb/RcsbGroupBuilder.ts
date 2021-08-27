import {rcsbFvCtxManager} from "../RcsbFvWeb/RcsbFvBuilder/RcsbFvContextManager";
import {Facet, QueryResult} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchResultInterface";
import {FacetStoreType} from "../RcsbSeacrh/FacetStore/FacetStore";
import {addGroupNodeToSearchQuery, searchGroupQuery} from "../RcsbSeacrh/QueryStore/SearchGroupQuery";
import {RcsbGroupDisplay} from "./RcsbGroupView/RcsbGroupDisplay";
import {SearchQuery} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchQueryInterface";
import {RcsbFvAdditionalConfig} from "../RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvCoreBuilder} from "../RcsbFvWeb/RcsbFvBuilder/RcsbFvCoreBuilder";

export async function buildSearchRequest(elementId: string, searchQuery:SearchQuery, facetStoreType: FacetStoreType): Promise<void>{
    const groupProperties: QueryResult = await rcsbFvCtxManager.getSearchQueryResult(searchQuery.query, facetStoreType);
    const properties: Array<Facet> = groupProperties.drilldown as Facet[];
    RcsbGroupDisplay.displaySearchAttributes(elementId, facetStoreType, properties);
}

export async function buildGroup(elementId: string, groupType: FacetStoreType, groupId: string, query?:SearchQuery): Promise<void>{
    switch (groupType){
        case "uniprot-entity-group":
            const queryResult: QueryResult = await rcsbFvCtxManager.getSearchQueryResult(query ? addGroupNodeToSearchQuery(groupId, query): searchGroupQuery(groupId), "uniprot-entity-group");
            const properties: Array<Facet> = queryResult.drilldown as Facet[];
            RcsbGroupDisplay.displaySearchAttributes(elementId, groupType, properties);
            break;
    }
}

export function buildUniprotEntityMembers(elementId: string, upAcc: string, additionalConfig?:RcsbFvAdditionalConfig, query?:SearchQuery): void {
    RcsbFvCoreBuilder.buildGroupMembers(elementId, upAcc, query);
}
