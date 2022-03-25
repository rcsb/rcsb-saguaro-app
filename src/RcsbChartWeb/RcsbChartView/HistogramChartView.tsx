import * as React from "react";
import {Bar, VictoryAxis, VictoryBar, VictoryChart, VictoryLabel, VictoryStack} from "victory";
import {ChartObjectInterface, ChartViewInterface} from "./ChartViewInterface";
import {ChartTools} from "../RcsbChartTools/ChartTools";
import {BarClickCallbackType, BarData, BarComponent} from "./ChartComponents/BarComponent";
import {ChartDataInterface} from "../RcsbChartData/ChartDataInterface";
import {HistogramChartData} from "../RcsbChartData/HistogramChartData";
import {TooltipFactory} from "./ChartComponents/TooltipFactory";
import {AbstractObserverChartView} from "./AbstractObserverChartView";
import {DependentAxisFactory} from "./ChartComponents/DependentAxisFactory";
import {CanvasBar, CanvasGroup} from "victory-canvas";

interface HisChatViewInterface {
    data: ChartObjectInterface[];
    subData: ChartObjectInterface[];
}

export class HistogramChartView extends AbstractObserverChartView {

    private readonly dataProvider: ChartDataInterface = new HistogramChartData();
    readonly state: HisChatViewInterface = {
        data: this.props.data,
        subData: this.props.subData
    };

    constructor(props: ChartViewInterface & {attributeName:string}) {
        super(props);
    }

    render():JSX.Element {
        this.dataProvider.setData(this.state.data, this.state.subData, this.props.config);
        const {barData, subData}: { barData: BarData[]; subData: BarData[] } = this.dataProvider.getChartData();
        const width: number = ChartTools.paddingLeft + ChartTools.constWidth + ChartTools.paddingRight;
        const dom = this.dataProvider.xDomain();
        const nBins: number = (dom[1]-dom[0])/this.props.config.histogramBinIncrement;
        return (
            <div style={{width:width, height:ChartTools.constHeight}}>
                <VictoryChart
                    padding={{left:ChartTools.paddingLeft, bottom:ChartTools.paddingTopLarge, top: ChartTools.paddingTop, right:ChartTools.paddingRight}}
                    height={ChartTools.constHeight}
                    width={width}
                    domain={{x:this.dataProvider.xDomain()}}
                    animate={true}
                >
                    {CROSS_AXIS}
                    {stack(barData, subData, nBins, this.props.config.barClickCallback)}
                    <VictoryAxis
                        tickFormat={(t) => {
                            if(this.props.config?.mergeDomainMaxValue){
                                if(parseFloat(t)<=this.props.config.mergeDomainMaxValue)
                                    return t;
                                else
                                    return "";
                            }
                            return t;
                        }}
                        tickLabelComponent={<VictoryLabel style={{fontFamily: ChartTools.fontFamily}} />}
                    />
                </VictoryChart>
            </div>
        );
    }

    componentDidMount() {
        super.subscribe();
    }

}

function stack(histData: BarData[], subData: BarData[], nBins: number, barClick:BarClickCallbackType): JSX.Element{
   return ( <VictoryStack>
       {bar(histData,nBins, "#5e94c3", <BarComponent barClick={barClick}/>, TooltipFactory.getTooltip({dx:-15}))}
       {bar(subData,nBins, "#d0d0d0", <BarComponent />)}
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

const CROSS_AXIS = DependentAxisFactory.getAxis();
