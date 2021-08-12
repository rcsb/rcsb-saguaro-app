import * as acm from "./RcsbAnnotationConfig.ac.json";
import {AnnotationConfigInterface} from "./AnnotationConfigInterface";

const annotationConfigMap: AnnotationConfigInterface = <any>acm;
export const RcsbAnnotationConstants = {
    provenanceColorCode:{
        rcsbPdb: (<AnnotationConfigInterface>annotationConfigMap).provenance_color_code.rcsb_pdb,
        external: (<AnnotationConfigInterface>annotationConfigMap).provenance_color_code.external
    },
    provenanceName: {
        pdb: "PDB",
        mmseqs: "MMseqs",
        promotif: "PROMOTIF",
        userInput: "USER INPUT"
    }
};
