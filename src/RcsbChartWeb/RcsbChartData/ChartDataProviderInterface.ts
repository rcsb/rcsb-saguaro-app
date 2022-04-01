import {ChartConfigInterface, ChartObjectInterface} from "../RcsbChartComponent/ChartConfigInterface";
import {ChartDataInterface} from "./ChartDataInterface";

export interface ChartDataProviderInterface extends ChartDataReaderInterface {
    setData(data: ChartObjectInterface[], subData: ChartObjectInterface[], config: ChartConfigInterface): void;
}

export interface ChartDataReaderInterface {
    getChartData(): {data: ChartDataInterface[]; excludedData?:ChartDataInterface[]}
    xDomain(): [number, number];
    tickValues(): string[] | number[] | undefined
}