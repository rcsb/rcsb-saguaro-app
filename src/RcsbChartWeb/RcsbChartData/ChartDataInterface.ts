import {ChartConfigInterface, ChartObjectInterface} from "../RcsbChartView/ChartViewInterface";
import {BarData} from "../RcsbChartView/RcsbChartComponents/BarComponent";

export interface ChartDataInterface {
    getChartData(): {barData: BarData[]; subData: BarData[];}
    setData(data: ChartObjectInterface[], subData: ChartObjectInterface[], config: ChartConfigInterface): void;
    xDomain?(): [number, number];
    tickValues?(): string[] | number[] | undefined
}