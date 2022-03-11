import {BarClickCallbackType} from "./RcsbChartComponents/BarComponent";

export interface ChartObjectInterface {
    label: string|number;
    population: number;
}

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
    barClickCallback?:BarClickCallbackType;
}

export interface ChartViewInterface {
    data: ChartObjectInterface[];
    subData?: ChartObjectInterface[];
    config?:ChartConfigInterface;
}

export enum ChartType {
    pie = "pie",
    histogram = "histogram",
    barplot = "barplot"
}