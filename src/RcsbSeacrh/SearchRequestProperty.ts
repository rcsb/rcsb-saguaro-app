import {SearchRequest} from "@rcsb/rcsb-api-tools/build/RcsbSearch/SearchRequest";
import {QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {ReturnType} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {GroupNode, SearchQuery, TerminalNode} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {FacetType} from "./FacetStore/FacetMemberInterface";
import {rcsbRequestClient} from "../RcsbRequest/RcsbRequestClient";

export type SearchQueryType = GroupNode | TerminalNode;

class SearchRequestProperty {

    private readonly getClient: ()=>SearchRequest;

    constructor(getClient: ()=>SearchRequest){
        this.getClient = getClient;
    }

    private async _requestFacets(config: {query: SearchQueryType; facets: FacetType[]; returnType: ReturnType;}): Promise<QueryResult | null> {
        return await this.getClient().request({
            query: config.query,
            request_options: config.facets.length > 0 ? {
                paginate:{
                    start: 0,
                    rows: 0
                },
                facets: [config.facets.shift(), ...config.facets]
            } : {
                paginate:{
                    start: 0,
                    rows: 0
                }
            },
            return_type: config.returnType
        });
    }

    public async requestFacets(query: SearchQueryType, facets: FacetType[], returnType:ReturnType): Promise<QueryResult | null> {
        return this._requestFacets({query:query, facets:facets, returnType:returnType});
    }

    public async requestMembers(query: SearchQuery): Promise<Array<string>> {
        return (await this.getClient().request({
            query: query.query,
            request_options: {
                return_all_hits: true
            },
            return_type: query.return_type
        })).result_set.map(item=>typeof item === "string" ? item : item.identifier);
    }

    public async requestCount(query: SearchQuery): Promise<number> {
        return (await this.getClient().request({
            query: query.query,
            request_options: {
                return_counts:true
            },
            return_type: query.return_type
        })).total_count;
    }

    public async request(query: SearchQuery): Promise<QueryResult | null> {
        return await this.getClient().request(query);
    }

}

export const searchRequestProperty = new SearchRequestProperty(()=>rcsbRequestClient.arches);