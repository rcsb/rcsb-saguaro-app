import * as React from "react";
import {Bar, VictoryAxis, VictoryBar, VictoryChart, VictoryStack, VictoryTooltip} from "victory";
import {ReactNode} from "react";
import {ChartViewInterface} from "./ChartViewInterface";
import {ChartTools} from "../RcsbChartTools/ChartTools";
import {DynamicTickLabelComponent} from "./RcsbChartComponents/DynamicTickLabelComponent";
import {BarClickCallbackType, BarComponent, BarData} from "./RcsbChartComponents/BarComponent";
import {ChartDataInterface} from "../RcsbChartData/ChartDataInterface";
import {BarChartData} from "../RcsbChartData/BarChartData";
import {TooltipComponent} from "./RcsbChartComponents/TooltipComponent";

export class BarChartView extends React.Component <ChartViewInterface,{}> {

    private dataProvider: ChartDataInterface;

    constructor(props: ChartViewInterface) {
        super(props);
    }

    render():ReactNode {
        this.dataProvider = new BarChartData(this.props.data, this.props.subData, this.props.config);
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
                    animate={{duration: 1000}}
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
        dataComponent={barComp ?? <Bar />}
        labels={labelComponent ? ()=>undefined : undefined}
        labelComponent={labelComponent}
    />)  : null;
}