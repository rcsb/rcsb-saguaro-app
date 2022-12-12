import {AbstractChartImplementation} from "../AbstractChartImplementation";
import {ChartTools} from "../../RcsbChartDataProvider/ChartTools";
import {AxisFactory} from "./Components/AxisFactory";
import {Bar, VictoryAxis, VictoryBar, VictoryChart, VictoryStack} from "victory";
import {LabelComponent} from "./Components/LabelComponent";
import * as React from "react";
import {BarComponent} from "./Components/BarComponent";
import {TooltipFactory} from "./Components/TooltipFactory";
import {ChartDataInterface, ChartDataValuesInterface} from "../../RcsbChartDataProvider/ChartDataProviderInterface";
import {ChartConfigInterface, ChartDisplayConfigInterface} from "../ChartConfigInterface";

export class VictoryBarChartComponent extends AbstractChartImplementation {
    render():JSX.Element {
        const {data}: {data: ChartDataInterface[]; excludedData?:ChartDataInterface[];} = this.props.dataProvider.getChartData();
        const displayConfig: Partial<ChartDisplayConfigInterface> = this.props.chartConfig.chartDisplayConfig
        return (<VictoryChart
            domainPadding={{ x: ChartTools.getConfig<number>("xDomainPadding",displayConfig) }}
            padding={{left:ChartTools.getConfig<number>("paddingLeft", displayConfig), top:ChartTools.getConfig<number>("paddingTopLarge",displayConfig), right:ChartTools.getConfig<number>("paddingRight",displayConfig)}}
            height={this.props.height}
            width={this.props.width}
            scale={{y:"linear", x:"linear"}}
        >
            {AxisFactory.getDependentAxis({orientation:"top", label:this.props.chartConfig.axisLabel})}
            {stack(data, this.props.chartConfig)}
            <VictoryAxis tickLabelComponent={<LabelComponent/>} />
        </VictoryChart>);
    }
}

//TODO <VictoryStack animate={true}> BarComponent props fails in capturing updated data
function stack(data:ChartDataInterface[], chartConfig?: ChartConfigInterface): JSX.Element{
    return ( <VictoryStack >
        {bar(
            data.map(d=>({
                ...d,
                y:d.y[0].value,
                color:d.y[0].color,
                values:d.y.map(v=>v.value),
                index:0
            })),
            0,
            "#5e94c3",
            <BarComponent barClick={chartConfig?.barClickCallback}/>,
            TooltipFactory.getTooltip({dx:15, tooltipText:chartConfig?.tooltipText}),
            chartConfig?.chartDisplayConfig
        )}
        {
            data[0].y.length > 1 ?
                Array(data[0].y.length-1).fill(undefined).map(
                    (e,n)=>bar(
                        data.map(d=>({
                            ...d,
                            y:d.y[n+1].value,
                            color:d.y[n+1].color,
                            values:d.y.map(v=>v.value),
                            index:n+1
                        })),
                        n+1,
                        "#d0d0d0",
                        <BarComponent />,
                        undefined,
                        chartConfig?.chartDisplayConfig
                    )
                )
                :
                undefined
        }
    </VictoryStack>);
}

function bar(data:ChartDataValuesInterface[], index:number, color: string, barComp: JSX.Element, labelComponent?:JSX.Element, chartDisplayConfig?:Partial<ChartDisplayConfigInterface>): JSX.Element {
    return data.length > 0 ? (<VictoryBar
        key={"victory_bar_"+index}
        barWidth={ChartTools.getConfig<number>("xDomainPadding", chartDisplayConfig)}
        style={{
            data: {
                fill: (d)=>(d.datum.color ?? color)
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