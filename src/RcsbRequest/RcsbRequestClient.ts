import {GraphQLRequest} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/GraphQLRequest";
import {SearchRequest} from "@rcsb/rcsb-api-tools/lib/RcsbSearch/SearchRequest";

export const rcsbRequestClient:{borrego:GraphQLRequest;yosemite:GraphQLRequest;arches:SearchRequest;} = {
    borrego: new GraphQLRequest("1d-coordinates"),
    yosemite: new GraphQLRequest("data-api"),
    arches: new SearchRequest()
};