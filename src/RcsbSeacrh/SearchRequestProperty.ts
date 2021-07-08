import {SearchRequest} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/SearchRequest";
import {QueryResult} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchResultInterface";
import {ReturnType} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchEnums";
import {GroupNode, TerminalNode} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchQueryInterface";
import {FacetTools} from "./Facets/FacetTools";
import {FacetType} from "./Facets/FacetStore";

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

    public async request(query: SearchQueryType, returnType: ReturnType): Promise<QueryResult> {
        //TODO Now we are using all defined facets in the face store (FacetTools.getFacetStores). In the future we may need to use only certain facets depending on the @returnType
        switch (returnType){
            case ReturnType.PolymerEntity:
                return this._request({query:query, facets:FacetTools.getFacetStores().map(f=>f.facet), returnType:returnType});
            case ReturnType.PolymerInstance:
                return this._request({query:query, facets:FacetTools.getFacetStores().map(f=>f.facet), returnType:returnType});
            case ReturnType.Entry:
                return this._request({query:query, facets:FacetTools.getFacetStores().map(f=>f.facet), returnType:returnType});
        }
    }

}