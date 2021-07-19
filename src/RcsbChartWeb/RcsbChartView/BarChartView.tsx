import * as React from "react";
import {VictoryAxis, VictoryBar, VictoryChart} from "victory";
import {ReactNode} from "react";
import {ChartObjectInterface, ChartViewInterface} from "./ChartViewInterface";
import {ChartTools} from "../RcsbChartTools/ChartTools";

type BarData = {categories:string[];values:{x: string, y:number}[];};
export class BarChartView extends React.Component <ChartViewInterface,ChartViewInterface> {

    readonly state: ChartViewInterface = {...this.props};

    constructor(props: ChartViewInterface) {
        super(props);
    }

    private dataByCategory(): BarData{
        const categories: string[] = Array.from(new Set(this.state.data.map(d=>d.label as string)));
        let data: {x:string;y:number;}[] = [];
        if(this.props.config?.mergeGroupSize ){
            data = ChartTools.mergeGroupSize(this.state.data, this.props.config.mergeGroupSize, this.props.config.mergeName);
        }else if(this.props.config?.mostPopulatedGroups) {
           data = ChartTools.mostPopulatedGroups(this.state.data, this.props.config.mostPopulatedGroups, this.props.config.mergeName);
        }else{
            data = ChartTools.labelsAsString(this.state.data);
        }
        return {
            categories: categories,
            values: data
        };
    }

    render():ReactNode {

        const barData: BarData = this.dataByCategory();
        const width: number = ChartTools.paddingLeft + ChartTools.constWidth + ChartTools.paddingRight;
        const height: number = ChartTools.paddingBottom + barData.values.length*ChartTools.xIncrement;
        return (
            <div style={{width:width, height:height}}>
                <VictoryChart
                    domainPadding={{ x: ChartTools.xDomainPadding }}
                    padding={{left:ChartTools.paddingLeft, bottom:ChartTools.paddingBottom, right:ChartTools.paddingRight}}
                    height={height}
                    width={width}
                >
                    <VictoryBar
                        barWidth={ChartTools.xDomainPadding}
                        style={{
                            data: {
                                fill: "#5e94c3",
                                stroke: "#325880",
                                strokeWidth: 1
                            }
                        }}
                        horizontal={true}
                        data={barData.values}
                    />
                    <VictoryAxis style={{tickLabels:{fontSize:12}}}/>
                    <VictoryAxis
                        dependentAxis={true}
                        crossAxis={true}
                        style={{
                            grid: {
                                stroke: "#999999",
                                strokeDasharray: "1 3"
                            }
                        }}
                    />
                </VictoryChart>
            </div>
        );
    }

}