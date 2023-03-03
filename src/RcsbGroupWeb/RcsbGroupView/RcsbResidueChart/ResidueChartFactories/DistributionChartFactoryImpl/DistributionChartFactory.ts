import {DistributionChartFactoryInterface, ResidueDistributionInterface} from "../ResidueDistributionFactoryInterface";
import {RcsbChartInterface} from "../../../../../RcsbSeacrh/FacetTools";
import {RcsbDistributionConfig} from "../../../../../RcsbAnnotationConfig/RcsbDistributionConfig";
import {Operator} from "../../../../../RcsbUtils/Helpers/Operator";
import {ChartObjectInterface, ChartType} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";
import {ChartDataValuesInterface} from "@rcsb/rcsb-charts/lib/RcsbChartDataProvider/ChartDataProviderInterface";

export class DistributionChartFactory implements DistributionChartFactoryInterface {

    private readonly distributionConfig: RcsbDistributionConfig;

    constructor(distributionConfig?: RcsbDistributionConfig) {
        this.distributionConfig = distributionConfig ?? new RcsbDistributionConfig();
    }

    getChart(residueDistribution: ResidueDistributionInterface): RcsbChartInterface {
        const sort: string[] | undefined = this.distributionConfig.getBlockConfig(residueDistribution.attribute)?.sort;
        const axisLabel: string | undefined = this.distributionConfig.getBlockConfig(residueDistribution.attribute)?.axisLabel;
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
            chartConfig: {
                sort: sort ? (a,b)=>(sort.findIndex(x=>x===a.id)-sort.findIndex(x=>x===b.id)) : undefined,
                tooltipText: (d: ChartDataValuesInterface)=>(`${Operator.digitGrouping(d.y)} residues`),
                axisLabel
            }
        };
    }

}