import * as React from "react";
import {Bar, VictoryBar, VictoryChart, VictoryStack} from "victory";
import {ChartTools} from "../RcsbChartTools/ChartTools";
import {BarClickCallbackType, BarData, BarComponent} from "./ChartComponents/BarComponent";
import {ChartDataProviderInterface} from "../RcsbChartData/ChartDataProviderInterface";
import {HistogramChartData} from "../RcsbChartData/HistogramChartData";
import {TooltipFactory} from "./ChartComponents/TooltipFactory";
import {AbstractChartComponent} from "./AbstractChartComponent";
import {AxisFactory} from "./ChartComponents/AxisFactory";


export class HistogramChartComponent extends AbstractChartComponent {

    protected readonly dataProvider: ChartDataProviderInterface = new HistogramChartData();

    render():JSX.Element {
        this.dataProvider.setData(this.state.data, this.state.subData, this.state.chartConfig);
        const {data}: { data: BarData[];} = this.dataProvider.getChartData();
        const width: number = ChartTools.paddingLeft + ChartTools.constWidth + ChartTools.paddingRight;
        const dom = this.dataProvider.xDomain();
        const nBins: number = (dom[1]-dom[0])/this.props.chartConfig.histogramBinIncrement;
        return (
            <div style={{width:width}}>
                <VictoryChart
                    padding={{left:ChartTools.paddingLeft, bottom:ChartTools.paddingTopLarge, top: ChartTools.paddingTop, right:ChartTools.paddingRight}}
                    height={ChartTools.constHeight}
                    width={width}
                    domain={{x:this.dataProvider.xDomain()}}
                >
                    {AxisFactory.getDependentAxis()}
                    {stack(data, nBins, this.props.chartConfig.barClickCallback)}
                    {AxisFactory.getRegularAxis(this.props.chartConfig)}
                </VictoryChart>
            </div>
        );
    }

}

function stack(data: BarData[], nBins: number, barClick:BarClickCallbackType): JSX.Element{
   return ( <VictoryStack animate={true}>
       {bar(data,nBins, "#5e94c3", <BarComponent barClick={barClick}/>, TooltipFactory.getTooltip({dx:-15}))}
       {bar(data.map(d=>({...d,y:d.yc,yc:d.y})),nBins, "#d0d0d0", <BarComponent />)}
    </VictoryStack>);
}

function bar(data: BarData[], nBins: number, color: string, barComp?: JSX.Element, labelComponent?: JSX.Element): JSX.Element {
   return data.length > 0 ? (<VictoryBar
       barWidth={(Math.ceil(ChartTools.constWidth/nBins)-3)}
       alignment={"middle"}
       style={{
           data: {
               fill: color
           }
       }}
       data={data}
       dataComponent={barComp ?? <Bar />}
       labels={labelComponent ? ()=>undefined : undefined}
       labelComponent={labelComponent}
   />)  : null;
}

