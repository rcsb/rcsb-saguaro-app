import {ChartMapType} from "./GroupChartLayout";


export interface GroupChartAdditionalProperties {
    componentMountCallback(chartMap: ChartMapType, layout:string[]):void;
    layoutConfig: LayoutConfigInterface;
}

export interface LayoutConfigInterface {
     [layoutKey:string]:{
            title:string|undefined;
     }
}
