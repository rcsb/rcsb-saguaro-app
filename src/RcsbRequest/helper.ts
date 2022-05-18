import {GraphQLRequest} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/GraphQLRequest";
import {SearchRequest} from "@rcsb/rcsb-api-tools/build/RcsbSearch/SearchRequest";
import {rcsbRequestClient} from "./RcsbRequestClient";

export function initializeBorregoClient(config?: RequestInit){
    rcsbRequestClient.borrego = new GraphQLRequest("1d-coordinates", config);
}

export function initializeYosemiteClient(config?: RequestInit){
    rcsbRequestClient.yosemite = new GraphQLRequest("data-api", config);
}

export function initializeArchesClient(config?: RequestInit){
    rcsbRequestClient.arches = new SearchRequest(undefined, undefined, config);
}