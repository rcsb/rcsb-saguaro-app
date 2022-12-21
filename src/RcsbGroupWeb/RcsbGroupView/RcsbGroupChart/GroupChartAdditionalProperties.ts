import {RcsbChartInterface} from "../../../RcsbSearch/FacetTools";


export interface GroupChartAdditionalProperties {
    componentMountCallback(chartMap: Map<string,RcsbChartInterface[]>, layout:string[]):void;
    layoutConfig: LayoutConfigInterface;
}

export type LayoutConfigInterface = Record<string, {
            title:string|undefined;
     }>;
