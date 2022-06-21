import {ChartDataInterface} from "../RcsbChartDataProvider/ChartDataProviderInterface";
import * as React from "react";

export interface ChartObjectInterface {
    label: string|number;
    population: number;
    objectConfig?:{
        objectId?:string;
        color?:string;
    };
}

export type BarClickCallbackType = (datum:ChartDataInterface, data:ChartDataInterface[], e:React.MouseEvent<any>)=>void;
export interface ChartConfigInterface {
    mergeGroupSize?: number;
    mergeDomainMaxValue?:number;
    mostPopulatedGroups?: number;
    mergeName?: string;
    domainMinValue?:number;
    histogramBinIncrement?: number;
    tickIncrement?: {
        origin: number;
        increment: number
    };
    axisLabel?:string
    barClickCallback?:BarClickCallbackType;
    sort?:(b: ChartDataInterface, a: ChartDataInterface) => number;
    tooltipText?:(a: ChartDataInterface) => string;
    chartDisplayConfig?: Partial<ChartDisplayConfigInterface>;
}
export interface ChartDisplayConfigInterface {
    paddingLeft: number;
    paddingTopLarge: number;
    paddingTop: number;
    paddingRight: number;
    constWidth: number;
    constHeight: number;
    xIncrement: number;
    xDomainPadding: number;
    barWidth: number;
    fontFamily: string;
    fontSize: number;
}

export enum ChartType {
    pie = "pie",
    histogram = "histogram",
    barplot = "barplot"
}