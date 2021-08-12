import {RcsbFvColorGradient, RcsbFvDisplayTypes} from "@rcsb/rcsb-saguaro";

export interface AnnotationConfigInterface {
    provenance_color_code: {
        external: string;
        rcsb_pdb: string;
    };
    merge?: Array<{
        merged_types: Array<string>,
        type: string;
        title: string;
        display: RcsbFvDisplayTypes;
    }>;
    external_data_order?: Array<string>;
    instance_order?: Array<string>;
    entity_order?: Array<string>;
    config: Array<RcsbAnnotationConfigInterface>
}

export interface RcsbAnnotationConfigInterface {
    type: string;
    display: RcsbFvDisplayTypes;
    color: string | RcsbFvColorGradient;
    title: string;
    prefix?: string;
    provenanceList: Set<string>;
    height?:number;
    key?: string;
    addToType?: string[];
    transformToNumerical?: boolean;
    domain?: [number,number];
    displayCooccurrence?: boolean;
    ignore?: boolean;
    fitTitleWidth?: boolean;
}
