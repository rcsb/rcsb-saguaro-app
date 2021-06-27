import {ChartPlot} from "rcsb-saguaro-charts";
import {ChartObjectInterface} from "rcsb-saguaro-charts/build/ChartView/ChartViewInterface";

export function piePlot(elementId: string, data: ChartObjectInterface[]): void{
    new ChartPlot(elementId, data);
}