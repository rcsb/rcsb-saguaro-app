import * as acm from "./RcsbAnnotationConfig.ac.json";
import {AnnotationConfigInterface} from "./AnnotationConfigInterface";

const annotationConfigMap: AnnotationConfigInterface = acm as AnnotationConfigInterface;
export const RcsbAnnotationConstants = {
    provenanceColorCode:{
        rcsbLink: (annotationConfigMap).provenance_color_code.rcsb_link,
        rcsbPdb: (annotationConfigMap).provenance_color_code.rcsb_pdb,
        external: (annotationConfigMap).provenance_color_code.external,
        csm: (annotationConfigMap).provenance_color_code.csm,
    },
    provenanceName: {
        pdb: "PDB",
        csm: "CSM",
        mmseqs: "MMseqs",
        promotif: "PROMOTIF",
        userInput: "USER INPUT"
    }
};
