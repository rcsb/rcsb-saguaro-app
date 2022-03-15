import * as React from "react";
import {Bar, VictoryAxis, VictoryBar, VictoryChart, VictoryStack} from "victory";
import {ReactNode} from "react";
import {ChartObjectInterface, ChartViewInterface} from "./ChartViewInterface";
import {ChartTools} from "../RcsbChartTools/ChartTools";
import {BarClickCallbackType, BarComponent, BarData} from "./RcsbChartComponents/BarComponent";
import {ChartDataInterface} from "../RcsbChartData/ChartDataInterface";
import {BarChartData} from "../RcsbChartData/BarChartData";
import {TooltipComponent} from "./RcsbChartComponents/TooltipComponent";
import {
    searchQueryContextManager,
    SearchQueryContextManagerSubjectInterface
} from "../../RcsbGroupWeb/RcsbGroupView/RcsbGroupDisplay/SearchQueryContextManager";
import {asyncScheduler} from "rxjs";
import {random} from "lodash";
import {TickLabelFactory as TLF} from "./RcsbChartComponents/TickLabelFactory";

interface BarChatViewInterface {
    data: ChartObjectInterface[];
    subData: ChartObjectInterface[];
}

export class BarChartView extends React.Component <ChartViewInterface & {attributeName:string}, BarChatViewInterface> {

    private readonly dataProvider: ChartDataInterface = new BarChartData();
    readonly state: BarChatViewInterface = {
        data: this.props.data,
        subData: this.props.subData
    };

    constructor(props: ChartViewInterface & {attributeName:string}) {
        super(props);
    }

    render():ReactNode {
        this.dataProvider.setData(this.state.data, this.state.subData, this.props.config);
        const {barData,subData}: {barData: BarData[]; subData: BarData[];} = this.dataProvider.getChartData();
        const width: number = ChartTools.paddingLeft + ChartTools.constWidth + ChartTools.paddingRight;
        const height: number = ChartTools.paddingTopLarge + barData.length*ChartTools.xIncrement;
        return (
            <div style={{width:width, height:height}}>
                <VictoryChart
                    domainPadding={{ x: ChartTools.xDomainPadding }}
                    padding={{left:ChartTools.paddingLeft, top:ChartTools.paddingTopLarge, right:ChartTools.paddingRight}}
                    height={height}
                    width={width}
                    scale={{y:"linear", x:"linear"}}
                    animate={{
                        duration: ChartTools.animationDuration
                    }}
                >
                    {CROSS_AXIS}
                    {stack(barData, subData,this.props.config.barClickCallback)}
                    <VictoryAxis tickValues={this.dataProvider.tickValues()} tickLabelComponent={TLF.getTickLabel()}/>
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
        }, this.props.attributeName === sqData.attributeName ? 0 : random(300,1200));

    }

}

const CROSS_AXIS = (<VictoryAxis
    dependentAxis={true}
    crossAxis={true}
    orientation="top"
    style={{
        grid: {
            stroke: "#999999",
            strokeDasharray: "1 3"
        }
    }}
/>);

function stack(data:BarData[],subData:BarData[],barClick:BarClickCallbackType): JSX.Element{
    return ( <VictoryStack>
        {bar(data, "#5e94c3", <BarComponent barClick={barClick}/>, <TooltipComponent dx={25} />)}
        {bar(subData, "#d0d0d0", <BarComponent />)}
    </VictoryStack>);
}

function bar(data:BarData[],color: string, barComp: JSX.Element, labelComponent?:JSX.Element): JSX.Element {
    return data.length > 0 ? (<VictoryBar
        barWidth={ChartTools.xDomainPadding}
        style={{
            data: {
                fill: color
            }
        }}
        horizontal={true}
        data={data}
        categories={{x:data.map(d=>d.x.toString())}}
        dataComponent={barComp ?? <Bar />}
        labels={labelComponent ? ()=>undefined : undefined}
        labelComponent={labelComponent}
    />)  : null;
}