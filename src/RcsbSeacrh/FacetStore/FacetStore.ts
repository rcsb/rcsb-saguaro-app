import {uniprotEntityGroupFacetStore} from "./UniprotEntityGroupFacetStore";
import {entityGranularityGroupFacetStore} from "./EntityGranularitySearchFacetStore";
import {FacetStoreInterface} from "./FacetStoreInterface";

export type FacetStoreType = "uniprot-entity-group" | "entity-granularity-group";

export class FacetStore {
    public static getStore(type: FacetStoreType): FacetStoreInterface {
        switch (type) {
            case "uniprot-entity-group":
                return uniprotEntityGroupFacetStore;
            case "entity-granularity-group":
                return entityGranularityGroupFacetStore;
        }
    }
}
