import {ChartConfigInterface, ChartObjectInterface} from "../RcsbChartComponent/ChartViewInterface";
import {BarData} from "../RcsbChartComponent/ChartComponents/BarComponent";

export interface ChartDataInterface {
    getChartData(): {barData: BarData[]; subData: BarData[];}
    setData(data: ChartObjectInterface[], subData: ChartObjectInterface[], config: ChartConfigInterface): void;
    xDomain?(): [number, number];
    tickValues?(): string[] | number[] | undefined
}