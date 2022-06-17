import {AbstractChartImplementation} from "../AbstractChartImplementation";
import {ChartTools} from "../../RcsbChartTools/ChartTools";
import {AxisFactory} from "./Components/AxisFactory";
import {Bar, VictoryBar, VictoryChart, VictoryStack} from "victory";
import * as React from "react";
import {BarComponent} from "./Components/BarComponent";
import {TooltipFactory} from "./Components/TooltipFactory";
import {ChartDataInterface} from "../../RcsbChartDataProvider/ChartDataProviderInterface";
import {BarClickCallbackType} from "../ChartConfigInterface";

export class VictoryHistogramChartComponent extends AbstractChartImplementation {

    render() {
        const {data}: { data: ChartDataInterface[];} = this.props.dataProvider.getChartData();
        const width: number = ChartTools.paddingLeft + ChartTools.constWidth + ChartTools.paddingRight;
        const dom = this.props.dataProvider.xDomain();
        const nBins: number = (dom[1]-dom[0])/this.props.chartConfig?.histogramBinIncrement;
        return (<VictoryChart
            padding={{left:ChartTools.paddingLeft, bottom:ChartTools.paddingTopLarge, top: ChartTools.paddingTop, right:ChartTools.paddingRight}}
            height={ChartTools.constHeight}
            width={width}
            domain={{x:this.props.dataProvider.xDomain()}}
        >
            {AxisFactory.getDependentAxis()}
            {stack(data, nBins, this.props.chartConfig?.barClickCallback)}
            {AxisFactory.getRegularAxis(this.props.chartConfig)}
        </VictoryChart>);
    }

}

function stack(data: ChartDataInterface[], nBins: number, barClick:BarClickCallbackType): JSX.Element{
    return ( <VictoryStack animate={true}>
        {bar(data,nBins, "#5e94c3", <BarComponent barClick={barClick}/>, TooltipFactory.getTooltip({dy:-15}))}
        {bar(data.map(d=>({...d,y:d.yc,yc:d.y})),nBins, "#d0d0d0", <BarComponent />)}
    </VictoryStack>);
}

function bar(data: ChartDataInterface[], nBins: number, color: string, barComp?: JSX.Element, labelComponent?: JSX.Element): JSX.Element {
    return data.length > 0 ? (<VictoryBar
        barWidth={(Math.ceil(ChartTools.constWidth/nBins)-3)}
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

