import * as React from "react";
import {Bar, VictoryAxis, VictoryBar, VictoryChart, VictoryStack, VictoryTooltip} from "victory";
import {ReactNode} from "react";
import {ChartViewInterface} from "./ChartViewInterface";
import {ChartTools} from "../RcsbChartTools/ChartTools";
import {DynamicTickLabelComponent} from "../RcsbChartTools/DynamicTickLabelComponent";
import {BarClickCallbackType, EventBarComponent, BarData} from "../RcsbChartTools/EventBarComponent";
import {ChartDataInterface} from "../RcsbChartData/ChartDataInterface";
import {BarChartData} from "../RcsbChartData/BarChartData";
import {TooltipComponent} from "../RcsbChartTools/TooltipComponent";

export class BarChartView extends React.Component <ChartViewInterface,ChartViewInterface> {

    readonly state: ChartViewInterface = {...this.props};
    readonly dataProvider: ChartDataInterface = new BarChartData(this.props.data, this.props.subData, this.props.config);

    constructor(props: ChartViewInterface) {
        super(props);
    }

    render():ReactNode {
        const {barData,subData}: {barData: BarData[]; subData: BarData[];} = this.dataProvider.getChartData();
        const width: number = ChartTools.paddingLeft + ChartTools.constWidth + ChartTools.paddingRight;
        const height: number = ChartTools.paddingBottom + barData.length*ChartTools.xIncrement;
        return (
            <div style={{width:width, height:height}}>
                <VictoryChart
                    domainPadding={{ x: ChartTools.xDomainPadding }}
                    padding={{left:ChartTools.paddingLeft, bottom:ChartTools.paddingBottom, right:ChartTools.paddingRight}}
                    height={height}
                    width={width}
                    scale={{y:"linear", x:"linear"}}
                >
                    {CROSS_AXIS}
                    {stack(barData, subData,this.props.config.barClickCallback)}
                    <VictoryAxis  tickLabelComponent={<DynamicTickLabelComponent/>}/>
                </VictoryChart>
            </div>
        );
    }

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

function stack(data:BarData[],subData:BarData[],barClick:BarClickCallbackType): JSX.Element{
    return ( <VictoryStack>
        {bar(data, "#5e94c3", <EventBarComponent barClick={barClick}/>, <TooltipComponent dx={25} />)}
        {bar(subData, "#d0d0d0", <EventBarComponent />)}
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
        dataComponent={barComp ?? <Bar />}
        labels={labelComponent ? ()=>undefined : undefined}
        labelComponent={labelComponent}
    />)  : null;
}