import {GraphQLRequest} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/GraphQLRequest";
import {SearchRequest} from "@rcsb/rcsb-api-tools/build/RcsbSearch/SearchRequest";

export const rcsbRequestClient:{borrego:GraphQLRequest;yosemite:GraphQLRequest;arches:SearchRequest;} = {
    borrego: new GraphQLRequest("borrego"),
    yosemite: new GraphQLRequest("yosemite"),
    arches: new SearchRequest()
};