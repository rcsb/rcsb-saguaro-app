import {FacetMemberInterface} from "./FacetMemberInterface";
import {ReturnType, Service} from "@rcsb/rcsb-api-tools/lib/RcsbSearch/Types/SearchEnums";

export interface FacetStoreInterface {
    getServices(): (Service.Text | Service.TextChem)[];
    getFacetService(service: Service|"all"): FacetMemberInterface[];
    readonly facetLayoutGrid: string[];
    readonly returnType:ReturnType;
}