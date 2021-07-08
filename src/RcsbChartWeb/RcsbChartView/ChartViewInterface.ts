
export interface ChartObjectInterface {
    label: string|number;
    population: number;
}

export interface ChartConfigInterface {
    mergeGroupSize?: number;
    mergeDomainMaxValue?:number;
    mostPopulatedGroups?: number;
    mergeName?: string;
    tickIncrement?: {
        origin: number;
        increment: number
    };
}

export interface ChartViewInterface {
    data: ChartObjectInterface[];
    config?:ChartConfigInterface;
}

export enum ChartType {
    pie = "pie",
    histogram = "histogram",
    barplot = "barplot"
}