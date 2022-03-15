import * as React from "react";
import {Bar, VictoryAxis, VictoryBar, VictoryChart, VictoryStack} from "victory";
import {ReactNode} from "react";
import {ChartObjectInterface, ChartViewInterface} from "./ChartViewInterface";
import {ChartTools} from "../RcsbChartTools/ChartTools";
import {BarClickCallbackType, BarData, BarComponent} from "./RcsbChartComponents/BarComponent";
import {ChartDataInterface} from "../RcsbChartData/ChartDataInterface";
import {HistogramChartData} from "../RcsbChartData/HistogramChartData";
import {TooltipComponent} from "./RcsbChartComponents/TooltipComponent";
import {
    searchQueryContextManager,
    SearchQueryContextManagerSubjectInterface
} from "../../RcsbGroupWeb/RcsbGroupView/RcsbGroupDisplay/SearchQueryContextManager";
import {asyncScheduler} from "rxjs";
import {random} from "lodash";

interface HisChatViewInterface {
    data: ChartObjectInterface[];
    subData: ChartObjectInterface[];
}

export class HistogramChartView extends React.Component <ChartViewInterface & {attributeName:string}, HisChatViewInterface> {

    private readonly dataProvider: ChartDataInterface = new HistogramChartData();
    readonly state: HisChatViewInterface = {
        data: this.props.data,
        subData: this.props.subData
    };

    constructor(props: ChartViewInterface & {attributeName:string}) {
        super(props);
    }

    render():ReactNode {
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
                    animate={{duration: ChartTools.animationDuration}}
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

    componentDidMount() {
        this.subscribe();
    }

    private subscribe(): void{
        searchQueryContextManager.subscribe({
            next:(o)=>{
                this.updateChartMap(o);
            }
        })
    }

    private updateChartMap(sqData: SearchQueryContextManagerSubjectInterface): void{
        if(!sqData.chartMap.get(this.props.attributeName))
            return;
        asyncScheduler.schedule(()=>{
            this.setState({
                data:sqData.chartMap.get(this.props.attributeName).chart.data,
                subData:sqData.chartMap.get(this.props.attributeName).subChart?.data,
            });
        }, this.props.attributeName === sqData.attributeName ? 0 : random(300,600));

    }

}

function stack(histData: BarData[], subData: BarData[], nBins: number, barClick:BarClickCallbackType): JSX.Element{
   return ( <VictoryStack>
       {bar(histData,nBins, "#5e94c3", <BarComponent barClick={barClick}/>, <TooltipComponent dy={-15}/>)}
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
