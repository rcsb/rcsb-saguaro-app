import {ChartMapType} from "./GroupChartLayout";

export interface GroupChartAdditionalProperties {
    componentMountCallback(chartMap: ChartMapType, layout:string[]):void;
}
