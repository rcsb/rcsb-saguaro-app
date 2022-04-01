import {ChartConfigInterface, ChartObjectInterface} from "../RcsbChartComponent/ChartConfigInterface";
import {BarData} from "../RcsbChartComponent/ChartComponents/BarComponent";

export interface ChartDataProviderInterface {
    getChartData(): {data: BarData[]; excludedData?:BarData[]}
    setData(data: ChartObjectInterface[], subData: ChartObjectInterface[], config: ChartConfigInterface): void;
    xDomain(): [number, number];
    tickValues(): string[] | number[] | undefined
}