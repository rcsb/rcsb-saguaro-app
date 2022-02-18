import {ChartMapType} from "../../../RcsbChartWeb/RcsbChartView/RcsbChartLayout";

export interface GroupDisplayAdditionalProperties {
    componentMountCallback(chartMap: ChartMapType, layout: [string,string?][]):void;
}
