import {FacetMemberInterface} from "./FacetMemberInterface";
import {ReturnType} from "@rcsb/rcsb-saguaro-api/build/RcsbSearch/Types/SearchEnums";

export interface FacetStoreInterface {
    readonly entryFacet: FacetMemberInterface[];
    readonly instanceFacet: FacetMemberInterface[];
    readonly entityFacet: FacetMemberInterface[];
    readonly facetLayoutGrid: [string,string?][];
    readonly returnType:ReturnType;
}