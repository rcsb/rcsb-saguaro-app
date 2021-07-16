import {rcsbFvCtxManager} from "../RcsbFvWeb/RcsbFvBuilder/RcsbFvContextManager";
import {SearchQueryType} from "../RcsbSeacrh/SearchRequestProperty";
import {Facet, QueryResult} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchResultInterface";
import {FacetStoreType} from "../RcsbSeacrh/FacetStore/FacetStore";
import {uniprotEntityGroupQuery} from "../RcsbSeacrh/QueryStore/UniprotEntityGroupQuery";
import {GroupKey} from "../RcsbGraphQL/RcsbClient";
import {RcsbGroupDisplay} from "./RcsbGroupView/RcsbGroupDisplay";
import {GroupPropertyInterface} from "../RcsbCollectTools/PropertyCollector/GroupPropertyCollector";

export async function buildSearchRequest(elementId: string, query:SearchQueryType, facetStoreType: FacetStoreType): Promise<void>{
    const groupProperties: QueryResult = await rcsbFvCtxManager.getSearchQueryResult(query, facetStoreType);
    const properties: Array<Facet> = groupProperties.drilldown as Facet[];
    RcsbGroupDisplay.displaySearchAttributes(elementId, facetStoreType, properties);
}

export async function buildUniprotEntityGroup(elementId: string, uniprotAcc: string, query?:SearchQueryType): Promise<void>{
    const queryResult: QueryResult = await rcsbFvCtxManager.getSearchQueryResult(query ?? uniprotEntityGroupQuery(uniprotAcc), "uniprot-entity-group");
    const properties: Array<Facet> = queryResult.drilldown as Facet[];
    const groupProperties: GroupPropertyInterface = await rcsbFvCtxManager.getGroupProperties(GroupKey.UniprotEntity, uniprotAcc);
    await RcsbGroupDisplay.displayGroup(elementId, "uniprot-entity-group", properties, groupProperties);
}