import * as React from "react";
import {Bar, VictoryAxis, VictoryBar, VictoryChart, VictoryStack} from "victory";
import {ChartTools} from "../RcsbChartTools/ChartTools";
import {BarClickCallbackType, BarComponent, BarData} from "./ChartComponents/BarComponent";
import {ChartDataInterface} from "../RcsbChartData/ChartDataInterface";
import {BarChartData} from "../RcsbChartData/BarChartData";
import {TooltipFactory} from "./ChartComponents/TooltipFactory";
import {AbstractChartComponent} from "./AbstractChartComponent";
import {AxisFactory} from "./ChartComponents/AxisFactory";
import {LabelComponent} from "./ChartComponents/LabelComponent";

export class BarChartComponent extends AbstractChartComponent {

    protected readonly dataProvider: ChartDataInterface = new BarChartData();
    private readonly EXPAND_NUMBER: number = 10;

    render():JSX.Element {
        this.dataProvider.setData(this.state.data, this.state.subData, this.state.chartConfig);
        const {barData,excludedData}: {barData: BarData[]; excludedData?:BarData[];} = this.dataProvider.getChartData();
        const width: number = ChartTools.paddingLeft + ChartTools.constWidth + ChartTools.paddingRight;
        const height: number = ChartTools.paddingTopLarge + barData.length*ChartTools.xIncrement;
        return (
            <div style={{width:width}}>
                <VictoryChart
                    domainPadding={{ x: ChartTools.xDomainPadding }}
                    padding={{left:ChartTools.paddingLeft, top:ChartTools.paddingTopLarge, right:ChartTools.paddingRight}}
                    height={height}
                    width={width}
                    scale={{y:"linear", x:"linear"}}
                >
                    {AxisFactory.getDependentAxis({orientation:"top"})}
                    {stack(barData, this.props.chartConfig.barClickCallback)}
                    <VictoryAxis tickLabelComponent={<LabelComponent/>} />
                </VictoryChart>
                {
                    excludedData.length > 0  || this.state.chartConfig.mostPopulatedGroups > this.props.chartConfig.mostPopulatedGroups ?
                         this.chartUI(excludedData.length): <></>
                }
            </div>
        );
    }

    private chartUI(excluded: number): JSX.Element {
        return (<div className={"mt-3 d-table"}  style={{height:22, fontFamily:ChartTools.fontFamily}}>
            <div className={"d-table-row"}>
                {
                    this.uiButton(
                        excluded > 0,
                       "bi-plus-circle",
                        (e)=>{
                            if(e.shiftKey){
                                this.updateCategories(excluded);
                            } else {
                                this.updateCategories(this.EXPAND_NUMBER);
                            }
                        },
                        "Shift-click to expand all"
                    )
                }
                {
                    this.uiButton(
                        this.state.chartConfig.mostPopulatedGroups > this.props.chartConfig.mostPopulatedGroups,
                        "bi-dash-circle",
                        (e)=>{
                            if(e.shiftKey){
                                this.updateCategories(0);
                            }else{
                                if(this.state.chartConfig.mostPopulatedGroups-this.EXPAND_NUMBER >= this.props.chartConfig.mostPopulatedGroups)
                                    this.updateCategories(-this.EXPAND_NUMBER);
                                else
                                    this.updateCategories(0);
                            }

                        },
                        "Shift-click to collapse all"
                    )
                }
                <div className={"ps-1 text-muted text-opacity-50 align-middle d-table-cell"} style={{fontSize:ChartTools.fontSize}}>[ {excluded}+ ]</div>
            </div>
        </div>);
    }

    private uiButton(activeFlag: boolean, className: string, onCLick: (e:React.MouseEvent)=>void, title?:string): JSX.Element {
        return (<div
            className={"pe-3 align-middle d-table-cell"+(activeFlag ? "" : " text-black-50 text-opacity-75")}
            onClick={(e)=>{
                onCLick(e);
            }}
        >
            <i title={title} role={ activeFlag ? "button" : undefined} className={"bi "+className} />
        </div>);
    }

    private updateCategories(n:number): void {
        if(n===0)
            this.setState({
                chartConfig:{
                    ...this.state.chartConfig,
                    mostPopulatedGroups: this.props.chartConfig.mostPopulatedGroups
                }
            });
        else if(this.state.chartConfig.mostPopulatedGroups+n >= this.props.chartConfig.mostPopulatedGroups)
            this.setState({
                chartConfig:{
                    ...this.state.chartConfig,
                    mostPopulatedGroups: this.state.chartConfig.mostPopulatedGroups + n
                }
            });
    }


}

function stack(data:BarData[],barClick:BarClickCallbackType): JSX.Element{
    return ( <VictoryStack animate={true}>
        {bar(data, "#5e94c3", <BarComponent barClick={barClick}/>, TooltipFactory.getTooltip({dx:25}))}
        {bar(data.map(d=>({...d,y:d.yc,yc:d.y})), "#d0d0d0", <BarComponent />)}
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