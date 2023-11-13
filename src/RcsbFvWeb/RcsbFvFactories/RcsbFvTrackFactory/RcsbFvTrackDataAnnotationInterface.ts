import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro/lib/RcsbDataManager/RcsbDataManager";

export interface RcsbFvTrackDataAnnotationInterface extends RcsbFvTrackDataElementInterface {
    /**Name of the start position. This information might be displayed in the annotation tooltip*/
    beginName?: string;
    /**Name of the end position. This information might be displayed in the annotation tooltip*/
    endName?: string;
    /**Annotation original reference start position. This information might be displayed in the annotation tooltip*/
    oriBegin?: number;
    /**Annotation original reference end position. This information might be displayed in the annotation tooltip*/
    oriEnd?: number;
    /**Name of the original reference start position. This information might be displayed in the annotation tooltip*/
    oriBeginName?: string;
    /**Name of the original reference end position. This information might be displayed in the annotation tooltip*/
    oriEndName?: string;
    /**Name of the original reference. This information might be displayed in the annotation tooltip*/
    indexName?: string;
    /**Annotation name. This information might be displayed in the annotation tooltip*/
    name?: string;
    /**Id of the annotation element (protein or gene) source*/
    sourceId?: string;
    /**Source reference database name*/
    source?: string;
    /**Name of the resource that dispatched the data*/
    provenanceName?: string;
    /**color associated to the resource that dispatched the data*/
    provenanceColor?: string;
    /**Description associated to the annotation. This information might be displayed in the annotation tooltip*/
    description?: Array<string>;
    /**Annotation Id*/
    featureId?: string;
    /**Annotation type. This information might be displayed in the annotation tooltip*/
    type?: string;
    /**Track title. This information might be displayed in the annotation tooltip*/
    title?: string;
}
