import {SearchRequest} from "@rcsb/rcsb-api-tools/build/RcsbSearch/SearchRequest";
import {QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {
    ResultsContentType,
    SearchQuery
} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {FacetType} from "./FacetStore/FacetMemberInterface";
import {rcsbRequestClient} from "../RcsbRequest/RcsbRequestClient";
import {SearchQueryTools as SQT} from "./SearchQueryTools";
import {SearchQueryType} from "@rcsb/rcsb-search-tools/lib/SearchQueryTools/SearchQueryInterfaces";

class SearchRequestProperty {

    private readonly getClient: ()=>SearchRequest;

    constructor(getClient: ()=>SearchRequest){
        this.getClient = getClient;
    }

    private async _requestFacets(config: {query: SearchQueryType; facets: FacetType[]; returnType: ReturnType; resultsContentType:ResultsContentType}): Promise<QueryResult | null> {
        const facet = config.facets.shift();
        return await this.getClient().request({
            query: config.query,
            request_options: facet ? {
                paginate:{
                    start: 0,
                    rows: 0
                },
                facets: [facet, ...config.facets],
                results_content_type: config.resultsContentType
            } : {
                paginate:{
                    start: 0,
                    rows: 0
                },
                results_content_type: config.resultsContentType
            },
            return_type: config.returnType
        });
    }

    public async requestFacets(query: SearchQueryType, facets: FacetType[], returnType:ReturnType, resultsContentType:ResultsContentType): Promise<QueryResult | null> {
        return this._requestFacets({query:query, facets:facets, returnType:returnType, resultsContentType:resultsContentType});
    }

    //TODO this should be part of `SearchQueryTools`
    public async requestMembers(query: SearchQuery): Promise<string[]> {
        return (await this.getClient().request({
            query: query.query,
            request_options: {
                return_all_hits: true,
                results_content_type: SQT.searchContentType(query)
            },
            return_type: query.return_type
        }))?.result_set?.map(item=>typeof item === "string" ? item : item.identifier) ?? [];
    }

    //TODO this should be part of `SearchQueryTools`
    public async requestCount(query: SearchQuery): Promise<number> {
        return (await this.getClient().request({
            query: query.query,
            request_options: {
                return_counts:true,
                results_content_type: SQT.searchContentType(query)
            },
            return_type: query.return_type
        }))?.total_count ?? -1;
    }

    public async request(query: SearchQuery): Promise<QueryResult | null> {
        return await this.getClient().request(query);
    }

}

export const searchRequestProperty = new SearchRequestProperty(()=>rcsbRequestClient.arches);