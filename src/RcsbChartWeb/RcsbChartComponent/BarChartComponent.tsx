import * as React from "react";
import {ChartTools} from "../RcsbChartTools/ChartTools";
import {ChartDataProviderInterface, ChartDataInterface} from "../RcsbChartDataProvider/ChartDataProviderInterface";
import {BarChartDataProvider} from "../RcsbChartDataProvider/BarChartDataProvider";
import {AbstractChartComponent} from "./AbstractChartComponent";
import {AbstractChartImplementationType} from "./AbstractChartImplementation";

export class BarChartComponent extends AbstractChartComponent {

    protected readonly dataProvider: ChartDataProviderInterface = new BarChartDataProvider();
    private readonly EXPAND_NUMBER: number = 10;

    render():JSX.Element {
        this.dataProvider.setData(this.state.data, this.state.subData, this.state.chartConfig);
        const {data,excludedData}: {data: ChartDataInterface[]; excludedData?:ChartDataInterface[];} = this.dataProvider.getChartData();
        const width: number = ChartTools.paddingLeft + ChartTools.constWidth + ChartTools.paddingRight;
        const height: number = ChartTools.paddingTopLarge + data.length*ChartTools.xIncrement;
        const ChartComponent: AbstractChartImplementationType = this.props.chartComponentImplementation;
        return (
            <div style={{width:width}}>
                <ChartComponent width={width} height={height} chartConfig={this.props.chartConfig} dataProvider={this.dataProvider}/>
                {
                    excludedData.length > 0  || this.state.chartConfig?.mostPopulatedGroups > this.props.chartConfig?.mostPopulatedGroups ?
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
                        this.state.chartConfig?.mostPopulatedGroups > this.props.chartConfig?.mostPopulatedGroups,
                        "bi-dash-circle",
                        (e)=>{
                            if(e.shiftKey){
                                this.updateCategories(0);
                            }else{
                                if(this.state.chartConfig?.mostPopulatedGroups-this.EXPAND_NUMBER >= this.props.chartConfig?.mostPopulatedGroups)
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
                    mostPopulatedGroups: this.props.chartConfig?.mostPopulatedGroups
                }
            });
        else if(this.state.chartConfig?.mostPopulatedGroups+n >= this.props.chartConfig?.mostPopulatedGroups)
            this.setState({
                chartConfig:{
                    ...this.state.chartConfig,
                    mostPopulatedGroups: this.state.chartConfig?.mostPopulatedGroups + n
                }
            });
    }


}