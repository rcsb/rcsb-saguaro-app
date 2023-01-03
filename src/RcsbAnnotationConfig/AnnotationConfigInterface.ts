import {RcsbFvColorGradient, RcsbFvDisplayTypes} from "@rcsb/rcsb-saguaro";
import {Feature} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";

//Positional annotation interfaces
export interface AnnotationConfigInterface {
    provenance_color_code: {
        external: string;
        rcsb_pdb: string;
        rcsb_link: string;
        csm: string;
    };
    merge?: {
        merged_types: string[],
        type: string;
        title: string;
        display: RcsbFvDisplayTypes;
    }[];
    external_data_order?: string[];
    instance_order?: string[];
    entity_order?: string[];
    config: RcsbAnnotationConfigInterface[]
}

export interface RcsbAnnotationConfigInterface {
    type: string;
    display: RcsbFvDisplayTypes;
    color?: string | RcsbFvColorGradient;
    title: string;
    prefix?: string;
    provenanceList: Set<string>;
    height?:number;
    key?: keyof Feature;
    addToType?: (keyof Feature)[];
    transformToNumerical?: boolean;
    domain?: [number,number];
    displayCooccurrence?: boolean;
    ignore?: boolean;
    fitTitleWidth?: boolean;
}

//Residue distribution interfaces
export interface RcsbDistributionConfigInterface {
    blockConfig: RcsbTrackBlockConfigInterface[];
    trackConfig: RcsbTrackConfigInterface[];
}

export interface RcsbTrackBlockConfigInterface {
    type: string;
    title: string;
    trackType: string[];
    sort: string[];
    contentType: "binary"|"numerical";
    undefTrack?: {
        label:string;
        color:string;
        id:string;
    }
    axisLabel?:string;
}

export interface RcsbTrackConfigInterface {
    type: string;
    color?:string;
    label?:string;
    numericalCategories?: {
        thresholds: number[];
        categories:{
            label:string;
            color: string;
            id: string;
        }[]
    };
}