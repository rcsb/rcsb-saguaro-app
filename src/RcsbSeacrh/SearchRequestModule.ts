import * as searchRequest from 'search-request'
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {SearchQueryType} from "./SearchRequestProperty";
import {cloneDeep} from "lodash";

export namespace SearchRequestModule {

    export function addNode(searchQuery: SearchQuery, node:SearchQueryType): SearchQuery {
        const query: SearchQuery = cloneDeep<SearchQuery>(searchQuery)
        searchRequest.addRefinement(query, node);
        console.log(query);
        return query;
    }

}
