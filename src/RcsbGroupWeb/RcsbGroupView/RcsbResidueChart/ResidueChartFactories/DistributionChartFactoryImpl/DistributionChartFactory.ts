import {DistributionChartFactoryInterface, ResidueDistributionInterface} from "../ResidueDistributionFactoryInterface";
import {RcsbChartInterface} from "../../../../../RcsbSeacrh/FacetTools";
import {RcsbDistributionConfig} from "../../../../../RcsbAnnotationConfig/RcsbDistributionConfig";
import {Operator} from "../../../../../RcsbUtils/Helpers/Operator";
import {ChartObjectInterface, ChartType} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartConfigInterface";
import {ChartDataValueInterface} from "@rcsb/rcsb-charts/lib/RcsbChartDataProvider/ChartDataProviderInterface";
import {RcsbSearchAttributeType} from "@rcsb/rcsb-api-tools/lib/RcsbSearch/Types/SearchMetadata";

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
            attribute: residueDistribution.attribute as RcsbSearchAttributeType,
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
                sort: sort ? (a,b)=>(sort.findIndex(x=>x===a.x)-sort.findIndex(x=>x===b.x)) : undefined,
                tooltipText: (d: ChartDataValueInterface)=>(`${Operator.digitGrouping(d.y)} residues`),
                axisLabel,
                domainEmptyBins: true
            }
        };
    }

}