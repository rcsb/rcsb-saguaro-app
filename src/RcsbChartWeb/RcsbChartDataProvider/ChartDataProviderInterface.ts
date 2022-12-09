import {ChartConfigInterface, ChartObjectInterface} from "../RcsbChartComponent/ChartConfigInterface";

export interface ChartDataInterface {
    x:string|number;
    y:{value:number;color?:string;}[];
    label?:string;
    isLabel?:boolean;
    id?:string;
}

export interface ChartDataValuesInterface extends Omit<ChartDataInterface, "y">{
    y:number;
    values:number[];
    index:number;
    color?:string;
}

export interface ChartDataProviderInterface extends ChartDataReaderInterface {
    setData(data: ChartObjectInterface[][],  config: ChartConfigInterface): void;
}

export interface ChartDataReaderInterface {
    getChartData(): {data: ChartDataInterface[]; excludedData?:ChartDataInterface[]}
    xDomain(): [number, number] | undefined;
    tickValues(): string[] | number[] | undefined
}