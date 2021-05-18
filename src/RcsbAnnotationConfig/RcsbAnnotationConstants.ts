import * as annotationMap from "./RcsbAnnotationConfig.json";

export const RcsbAnnotationConstants = {
    provenanceColorCode:{
        rcsbPdb: (<any>annotationMap).provenance_color_code.rcsb_pdb,
        external: (<any>annotationMap).provenance_color_code.external
    },
    provenanceName: {
        pdb: "PDB",
        mmseqs: "MMseqs",
        promotif: "PROMOTIF",
        userInput: "USER INPUT"
    }
};
