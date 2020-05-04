import * as annotationMap from "./RcsbAnnotationMap.json";

export const RcsbAnnotationConstants = {
    provenanceColorCode:{
        rcsbPdb: (<any>annotationMap).provenance_code.rcsb_pdb,
        external: (<any>annotationMap).provenance_code.external
    }
};
