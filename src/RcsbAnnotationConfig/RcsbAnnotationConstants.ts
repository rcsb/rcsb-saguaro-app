import * as annotationMap from "./RcsbAnnotationMap.json";

export const RcsbAnnotationConstants = {
    provenanceColorCode:{
        rcsbPdb: (<any>annotationMap).provenance_color_code.rcsb_pdb,
        external: (<any>annotationMap).provenance_color_code.external
    },
    provenanceName: {
        pdb: "PDB",
        promotif: "PROMOTIF"
    }
};
