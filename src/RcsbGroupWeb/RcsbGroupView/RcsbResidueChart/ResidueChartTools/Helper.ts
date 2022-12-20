import {RcsbChartInterface} from "../../../../RcsbSeacrh/FacetTools";
import {ChartObjectInterface} from "@rcsb/rcsb-charts/build/dist/RcsbChartComponent/ChartConfigInterface";

export namespace Helper {

    export function mergeCharts(charts: RcsbChartInterface[]): RcsbChartInterface[] {
        const attributes: string[] = Array.from(new Set(charts.map(ch=>ch.attribute)));
        return attributes.map(attr=>(
            mergeChartData(charts.filter(ch=>ch.attribute == attr))
        ));
    }

    function mergeChartData(charts: RcsbChartInterface[]): RcsbChartInterface {
        return {
            ...charts[0],
            data: mergeData(charts.map(ch=>ch.data).flat())
        };
    }

    function mergeData(data: ChartObjectInterface[]): ChartObjectInterface[] {
        const labels: (string|number)[] = Array.from(new Set(data.map(d=>d.label)));
        return labels.map(label=>({
            ...data.find(d=>d.label===label),
            population: data.filter(d=>d.label===label).reduce((prev,curr)=>(prev+curr.population),0),
        }));
    }
}