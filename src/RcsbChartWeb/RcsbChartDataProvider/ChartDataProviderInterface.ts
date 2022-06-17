import {ChartConfigInterface, ChartObjectInterface} from "../RcsbChartComponent/ChartConfigInterface";

export interface ChartDataInterface {
    x:string|number;
    y:number;
    yc?:number;
    label?:string;
    isLabel?:boolean;
    color?:string;
    id?:string;
}

export interface ChartDataProviderInterface extends ChartDataReaderInterface {
    setData(data: ChartObjectInterface[], subData: ChartObjectInterface[], config: ChartConfigInterface): void;
}

export interface ChartDataReaderInterface {
    getChartData(): {data: ChartDataInterface[]; excludedData?:ChartDataInterface[]}
    xDomain(): [number, number] | undefined;
    tickValues(): string[] | number[] | undefined
}