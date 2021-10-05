import {FacetMemberInterface} from "./FacetMemberInterface";
import {ReturnType, Service} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";

export interface FacetStoreInterface {
    getServices(): Service[];
    getFacetService(service: Service|"all"): FacetMemberInterface[];
    readonly facetLayoutGrid: [string,string?][];
    readonly returnType:ReturnType;
}