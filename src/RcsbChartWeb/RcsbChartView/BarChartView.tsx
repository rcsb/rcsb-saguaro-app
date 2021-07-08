import * as React from "react";
import {VictoryAxis, VictoryBar, VictoryChart} from "victory";
import {ReactNode} from "react";
import {ChartObjectInterface, ChartViewInterface} from "./ChartViewInterface";

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
            data = this.state.data.filter(d=>(this.props.config?.mergeGroupSize && d.population>this.props.config.mergeGroupSize)).map(d=>({
                x:d.label  as string,
                y:d.population
            }));
            data.push({
                x: this.props.config?.mergeName ?? "Other",
                y: this.state.data.filter(d=>(this.props.config && this.props.config.mergeGroupSize && d.population<=this.props.config.mergeGroupSize)).length
            })
        }else if(this.props.config?.mostPopulatedGroups) {
            const sorted:ChartObjectInterface[] = this.state.data.sort((a,b)=>(b.population-a.population));

            data = sorted.slice(0,this.props.config.mostPopulatedGroups).map(d=>({
                x:d.label  as string,
                y:d.population
            }));
            data.push({
                x:this.props.config?.mergeName ?? "Other",
                y:sorted.slice(this.props.config.mostPopulatedGroups).reduce((a, b) => a + b.population, 0)
            })
        }else{
            data = this.state.data.map(d=>({
                x:d.label  as string,
                y:d.population
            }))
        }
        return {
            categories: categories,
            values: data
        };
    }

    render():ReactNode {

        const barData: BarData = this.dataByCategory();
        const paddingBottom: number = 50;
        const paddingLeft: number = 200;
        const width: number = paddingLeft + 250;
        const height: number = paddingBottom + barData.values.length*20;
        return (
            <div style={{width:width, height:height}}>
                <VictoryChart
                    domainPadding={{ x: 10 }}
                    padding={{left:paddingLeft, bottom:paddingBottom}}
                    height={height}
                    width={width}
                >
                    <VictoryBar
                        barWidth={10}
                        style={{
                            data: {
                                fill: "#5e94c3",
                                stroke: "#325880",
                                strokeWidth: 1
                            }//5e94c3
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