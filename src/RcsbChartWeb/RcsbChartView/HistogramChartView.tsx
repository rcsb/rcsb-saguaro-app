import * as React from "react";
import {Bar, VictoryAxis, VictoryBar, VictoryChart, VictoryStack} from "victory";
import {ReactNode} from "react";
import {ChartViewInterface} from "./ChartViewInterface";
import {ChartTools} from "../RcsbChartTools/ChartTools";
import {BarClickCallbackType, BarData, EventBar} from "../RcsbChartTools/EventBar";
import {ChartDataInterface} from "../RcsbChartData/ChartDataInterface";
import {HistogramChartData} from "../RcsbChartData/HistogramChartData";


export class HistogramChartView extends React.Component <ChartViewInterface,ChartViewInterface> {

    readonly state: ChartViewInterface = {...this.props};
    readonly dataProvider: ChartDataInterface = new HistogramChartData(this.props.data, this.props.subData, this.props.config);

    constructor(props: ChartViewInterface) {
        super(props);
    }

    render():ReactNode {
        const {barData, subData}: { barData: BarData[]; subData: BarData[] } = this.dataProvider.getChartData();
        const width: number = ChartTools.paddingLeft + ChartTools.constWidth + ChartTools.paddingRight;
        const dom = this.dataProvider.xDomain();
        const nBins: number = (dom[1]-dom[0])/this.props.config.histogramBinIncrement;
        return (
            <div style={{width:width, height:ChartTools.constHeight}}>
                <VictoryChart
                    padding={{left:ChartTools.paddingLeft, bottom:ChartTools.paddingBottom, top: ChartTools.paddingTop, right:ChartTools.paddingRight}}
                    height={ChartTools.constHeight}
                    width={width}
                    domain={{x:this.dataProvider.xDomain()}}
                >
                    {CROSS_AXIS}
                    {stack(barData, subData, nBins, this.props.config.barClickCallback)}
                    <VictoryAxis tickValues={this.dataProvider.tickValues()} tickFormat={(t) => {
                        if(this.props.config?.mergeDomainMaxValue){
                            if(parseFloat(t)<=this.props.config.mergeDomainMaxValue)
                                return t;
                            else
                                return "";
                        }
                        return t;
                    }}/>

                </VictoryChart>
            </div>
        );
    }

}

function stack(histData: BarData[], subData: BarData[], nBins: number, barClick:BarClickCallbackType): JSX.Element{
   return ( <VictoryStack>
       {bar(histData,nBins, "#5e94c3", <EventBar barClick={barClick}/>)}
       {bar(subData,nBins, "#d0d0d0", <EventBar />)}
    </VictoryStack>);
}

function bar(data: BarData[], nBins: number, color: string, barComp?: JSX.Element): JSX.Element {
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
   />)  : null;
}

const CROSS_AXIS = (<VictoryAxis
    dependentAxis={true}
    crossAxis={true}
    style={{
        grid: {
            stroke: "#999999",
            strokeDasharray: "1 3"
        }
    }}
/>);
