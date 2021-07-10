import {rcsbFvCtxManager} from "../RcsbFvWeb/RcsbFvBuilder/RcsbFvContextManager";
import {SearchQueryType} from "../RcsbSeacrh/SearchRequestProperty";
import {Facet, QueryResult} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchResultInterface";
import {RcsbChartDisplay} from "./RcsbChartDisplay/RcsbChartDisplay";
import {FacetStoreType} from "../RcsbSeacrh/FacetStore/FacetStore";
import {uniprotEntityGroupQuery} from "../RcsbSeacrh/QueryStore/UniprotEntityGroupQuery";

export async function searchRequestPlot(elementId: string, query:SearchQueryType, facetStoreType: FacetStoreType): Promise<void>{
    const groupProperties: QueryResult = await rcsbFvCtxManager.getSearchRequestProperties(query, facetStoreType);
    const properties: Array<Facet> = groupProperties.drilldown as Facet[];
    RcsbChartDisplay.displayAttributes(elementId, facetStoreType, properties);
}

export async function uniprotEntityGroupPlot(elementId: string, uniprotAcc: string): Promise<void>{
    const groupProperties: QueryResult = await rcsbFvCtxManager.getSearchRequestProperties(uniprotEntityGroupQuery(uniprotAcc), "uniprot-entity-group");
    const properties: Array<Facet> = groupProperties.drilldown as Facet[];
    RcsbChartDisplay.displayAttributes(elementId, "uniprot-entity-group", properties);
}