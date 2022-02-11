import {ChartConfigInterface, ChartObjectInterface} from "../RcsbChartView/ChartViewInterface";
import {BarData} from "../RcsbChartTools/EventBar";

export interface ChartDataInterface {
    readonly data: ChartObjectInterface[] ;
    readonly subData: ChartObjectInterface[];
    readonly config: ChartConfigInterface;
    getChartData(): {barData: BarData[]; subData: BarData[];}
    xDomain?(): [number, number];
    tickValues?(): number[] | undefined
}