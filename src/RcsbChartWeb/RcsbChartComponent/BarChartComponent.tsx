import * as React from "react";
import {Bar, VictoryAxis, VictoryBar, VictoryChart, VictoryLabel, VictoryStack} from "victory";
import {ChartObjectInterface, ChartViewInterface} from "./ChartViewInterface";
import {ChartTools} from "../RcsbChartTools/ChartTools";
import {BarClickCallbackType, BarComponent, BarData} from "./ChartComponents/BarComponent";
import {ChartDataInterface} from "../RcsbChartData/ChartDataInterface";
import {BarChartData} from "../RcsbChartData/BarChartData";
import {TooltipFactory} from "./ChartComponents/TooltipFactory";
import {AbstractChartComponent} from "./AbstractChartComponent";
import {DependentAxisFactory} from "./ChartComponents/DependentAxisFactory";
import {LabelComponent} from "./ChartComponents/LabelComponent";
import {CanvasBar, CanvasGroup} from "victory-canvas";

interface BarChatViewInterface {
    data: ChartObjectInterface[];
    subData: ChartObjectInterface[];
}

export class BarChartComponent extends AbstractChartComponent {

    private readonly dataProvider: ChartDataInterface = new BarChartData();
    readonly state: BarChatViewInterface = {
        data: this.props.data,
        subData: this.props.subData
    };

    constructor(props: ChartViewInterface & {attributeName:string}) {
        super(props);
    }

    render():JSX.Element {
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
                    animate={true}
                >
                    {CROSS_AXIS}
                    {stack(barData, subData,this.props.config.barClickCallback)}
                    <VictoryAxis tickLabelComponent={<LabelComponent/>} />
                </VictoryChart>
            </div>
        );
    }

    componentDidMount() {
        super.subscribe();
    }

}

const CROSS_AXIS: JSX.Element = DependentAxisFactory.getAxis({orientation:"top"});

function stack(data:BarData[],subData:BarData[],barClick:BarClickCallbackType): JSX.Element{
    return ( <VictoryStack>
        {bar(data, "#5e94c3", <BarComponent barClick={barClick}/>, TooltipFactory.getTooltip({dx:25}))}
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