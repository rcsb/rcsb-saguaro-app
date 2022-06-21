import {AbstractChartImplementation} from "../AbstractChartImplementation";
import {ChartTools} from "../../RcsbChartTools/ChartTools";
import {AxisFactory} from "./Components/AxisFactory";
import {Bar, VictoryBar, VictoryChart, VictoryStack} from "victory";
import * as React from "react";
import {BarComponent} from "./Components/BarComponent";
import {TooltipFactory} from "./Components/TooltipFactory";
import {ChartDataInterface} from "../../RcsbChartDataProvider/ChartDataProviderInterface";
import {BarClickCallbackType, ChartConfigInterface, ChartDisplayConfigInterface} from "../ChartConfigInterface";

export class VictoryHistogramChartComponent extends AbstractChartImplementation {

    render() {
        const {data}: { data: ChartDataInterface[];} = this.props.dataProvider.getChartData();
        const displayConfig: Partial<ChartDisplayConfigInterface> = this.props.chartConfig.chartDisplayConfig
        const width: number = ChartTools.getConfig<number>("paddingLeft", displayConfig) + ChartTools.getConfig<number>("constWidth", displayConfig) + ChartTools.getConfig<number>("paddingRight", displayConfig);
        const dom = this.props.dataProvider.xDomain();
        const nBins: number = (dom[1]-dom[0])/this.props.chartConfig?.histogramBinIncrement;
        return (<VictoryChart
            padding={{left:ChartTools.getConfig<number>("paddingLeft", displayConfig), bottom:ChartTools.getConfig<number>("paddingTopLarge", displayConfig), top: ChartTools.getConfig<number>("paddingTop", displayConfig), right:ChartTools.getConfig<number>("paddingRight", displayConfig)}}
            height={ChartTools.getConfig<number>("constHeight", displayConfig)}
            width={width}
            domain={{x:this.props.dataProvider.xDomain()}}
        >
            {AxisFactory.getDependentAxis()}
            {stack(data, nBins, this.props.chartConfig)}
            {AxisFactory.getRegularAxis(this.props.chartConfig)}
        </VictoryChart>);
    }

}

//TODO <VictoryStack animate={true}> BarComponent props fails in capturing updated data
function stack(data: ChartDataInterface[], nBins: number,chartConfig?: ChartConfigInterface): JSX.Element{
    return ( <VictoryStack >
        {bar(data,nBins, "#5e94c3", <BarComponent barClick={chartConfig?.barClickCallback}/>, TooltipFactory.getTooltip({dy:-15, tooltipText:chartConfig?.tooltipText}), chartConfig?.chartDisplayConfig)}
        {bar(data.map(d=>({...d,y:d.yc,yc:d.y})),nBins, "#d0d0d0", <BarComponent />, undefined, chartConfig?.chartDisplayConfig)}
    </VictoryStack>);
}

function bar(data: ChartDataInterface[], nBins: number, color: string, barComp?: JSX.Element, labelComponent?: JSX.Element, chartDisplayConfig?:Partial<ChartDisplayConfigInterface>): JSX.Element {
    return data.length > 0 ? (<VictoryBar
        barWidth={(Math.ceil(ChartTools.getConfig<number>("constWidth", chartDisplayConfig)/nBins)-3)}
        alignment={"middle"}
        style={{
            data: {
                fill: (d)=>(d.datum.color ?? color)
            }
        }}
        data={data}
        dataComponent={barComp ?? <Bar />}
        labels={labelComponent ? ()=>undefined : undefined}
        labelComponent={labelComponent}
    />)  : null;
}

