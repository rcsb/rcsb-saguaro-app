import {AbstractChartImplementation} from "../AbstractChartImplementation";
import {ChartTools} from "../../RcsbChartTools/ChartTools";
import {AxisFactory} from "./Components/AxisFactory";
import {Bar, VictoryAxis, VictoryBar, VictoryChart, VictoryStack} from "victory";
import {LabelComponent} from "./Components/LabelComponent";
import * as React from "react";
import {BarComponent} from "./Components/BarComponent";
import {TooltipFactory} from "./Components/TooltipFactory";
import {ChartDataInterface} from "../../RcsbChartDataProvider/ChartDataProviderInterface";
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
            {AxisFactory.getDependentAxis({orientation:"top"})}
            {stack(data, this.props.chartConfig)}
            <VictoryAxis tickLabelComponent={<LabelComponent/>} />
        </VictoryChart>);
    }
}

//TODO <VictoryStack animate={true}> BarComponent props fails in capturing updated data
function stack(data:ChartDataInterface[], chartConfig?: ChartConfigInterface): JSX.Element{
    return ( <VictoryStack >
        {bar(data, "#5e94c3", <BarComponent barClick={chartConfig?.barClickCallback}/>, TooltipFactory.getTooltip({dx:25, tooltipText:chartConfig?.tooltipText}), chartConfig?.chartDisplayConfig)}
        {bar(data.map(d=>({...d,y:d.yc,yc:d.y})), "#d0d0d0", <BarComponent />, undefined, chartConfig?.chartDisplayConfig)}
    </VictoryStack>);
}

function bar(data:ChartDataInterface[], color: string, barComp: JSX.Element, labelComponent?:JSX.Element, chartDisplayConfig?:Partial<ChartDisplayConfigInterface>): JSX.Element {
    return data.length > 0 ? (<VictoryBar
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