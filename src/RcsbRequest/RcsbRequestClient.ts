import {GraphQLRequest} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/GraphQLRequest";
import {SearchRequest} from "@rcsb/rcsb-api-tools/build/RcsbSearch/SearchRequest";

export const rcsbRequestClient:{borrego:GraphQLRequest;yosemite:GraphQLRequest;arches:SearchRequest;} = {
    borrego: new GraphQLRequest("http://132.249.213.142/graphql"),
    yosemite: new GraphQLRequest("https://data-models.rcsb.org/graphql"),
    arches: new SearchRequest()
};