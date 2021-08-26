import {SearchRequest} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/SearchRequest";
import {QueryResult} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchResultInterface";
import {ReturnType} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchEnums";
import {GroupNode, SearchQuery, TerminalNode} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchQueryInterface";
import {FacetTools} from "./FacetTools";
import {FacetType} from "./FacetStore/FacetMemberInterface";
import {FacetStoreType} from "./FacetStore/FacetStore";

export type SearchQueryType = GroupNode | TerminalNode;

export class SearchRequestProperty {

    private searchRequest: SearchRequest = new SearchRequest();

    private async _request(config: {query: SearchQueryType; facets: FacetType[]; returnType: ReturnType;}): Promise<QueryResult> {
        return await this.searchRequest.request({
            query: config.query,
            request_options: config.facets.length > 0 ? {
                pager:{
                    start: 0,
                    rows: 0
                },
                facets: [config.facets.shift(), ...config.facets]
            } : {
                pager:{
                    start: 0,
                    rows: 0
                }
            },
            return_type: config.returnType
        });
    }

    public async request(query: SearchQueryType, facetStoreType: FacetStoreType): Promise<QueryResult> {
        return this._request({query:query, facets:FacetTools.getFacetStores(facetStoreType).map(f=>f.facet), returnType:FacetTools.getReturnType(facetStoreType)});
    }

    public async requestMembers(query: SearchQuery): Promise<Array<string>> {
        return (await this.searchRequest.request({
            query: query.query,
            request_options: {
                return_all_hits: true
            },
            return_type: query.return_type
        })).result_set.map(item=>item.identifier);
    }

}