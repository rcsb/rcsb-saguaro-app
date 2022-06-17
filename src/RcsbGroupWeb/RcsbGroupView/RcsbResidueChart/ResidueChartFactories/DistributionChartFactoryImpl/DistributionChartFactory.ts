import {DistributionChartFactoryInterface, ResidueDistributionInterface} from "../ResidueDistributionFactoryInterface";
import {RcsbChartInterface} from "../../../../../RcsbSeacrh/FacetTools";
import {ChartObjectInterface, ChartType} from "../../../../../RcsbChartWeb/RcsbChartComponent/ChartConfigInterface";

export class DistributionChartFactory implements DistributionChartFactoryInterface {

    getChart(residueDistribution: ResidueDistributionInterface): RcsbChartInterface {
        return {
            chartType: ChartType.barplot,
            attribute: residueDistribution.attribute,
            attributeName: residueDistribution.attribute,
            contentType: "number",
            data: residueDistribution.buckets.map<ChartObjectInterface>(b=>({
                label:b.label,
                population:b.residueSet.size,
                objectConfig:{
                    color: b.color,
                    objectId: b.id
                }
            })),
            title: residueDistribution.title,
            //chartConfig:{}
        };
    }

}