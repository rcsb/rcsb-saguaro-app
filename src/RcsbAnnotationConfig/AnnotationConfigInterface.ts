
//Positional annotation interfaces
import {RcsbFvDisplayTypes} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvColorGradient} from "@rcsb/rcsb-saguaro/lib/RcsbDataManager/RcsbDataManager";

export interface AnnotationConfigInterface {
    provenance_color_code: {
        external: string;
        rcsb_pdb: string;
        rcsb_link: string;
        csm: string;
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
    color?: string | RcsbFvColorGradient;
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