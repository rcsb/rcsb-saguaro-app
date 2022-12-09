import {DistributionChartFactoryInterface, ResidueDistributionInterface} from "../ResidueDistributionFactoryInterface";
import {RcsbChartInterface} from "../../../../../RcsbSeacrh/FacetTools";
import {ChartObjectInterface, ChartType} from "../../../../../RcsbChartWeb/RcsbChartComponent/ChartConfigInterface";
import {RcsbDistributionConfig} from "../../../../../RcsbAnnotationConfig/RcsbDistributionConfig";
import {
    ChartDataValuesInterface
} from "../../../../../RcsbChartWeb/RcsbChartDataProvider/ChartDataProviderInterface";
import {Operator} from "../../../../../RcsbUtils/Helpers/Operator";

export class DistributionChartFactory implements DistributionChartFactoryInterface {

    private readonly distributionConfig: RcsbDistributionConfig;

    constructor(distributionConfig?: RcsbDistributionConfig) {
        this.distributionConfig = distributionConfig ?? new RcsbDistributionConfig();
    }

    getChart(residueDistribution: ResidueDistributionInterface): RcsbChartInterface {
        const sort: string[] | undefined = this.distributionConfig.getBlockConfig(residueDistribution.attribute).sort;
        const axisLabel: string | undefined = this.distributionConfig.getBlockConfig(residueDistribution.attribute).axisLabel;
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