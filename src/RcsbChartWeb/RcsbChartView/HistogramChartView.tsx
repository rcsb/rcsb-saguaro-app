import * as React from "react";
import {VictoryAxis, VictoryBar, VictoryChart, VictoryContainer} from "victory";
import {ReactNode} from "react";
import {ChartViewInterface} from "./ChartViewInterface";

export class HistogramChartView extends React.Component <ChartViewInterface,ChartViewInterface> {

    readonly state: ChartViewInterface = {...this.props};

    constructor(props: ChartViewInterface) {
        super(props);
    }

    private data(): {x:number;y:number}[]{
        let data: {x:number;y:number}[] = [];
        if(this.props.config?.mergeDomainMaxValue) {
            const thr: number = this.props.config?.mergeDomainMaxValue;
            data = this.state.data.filter(d => parseFloat(d.label as string) < thr).map(d => ({
                x: parseFloat(d.label as string),
                y: d.population
            }));
            data.push({
                x:thr,
                y:this.state.data.filter(d => parseFloat(d.label as string) >= thr).reduce((a, b) => a + b.population, 0)
            });
        }else{
            data = this.state.data.map(d=>({x: parseFloat(d.label as string), y:d.population}));
        }
        return data;
    }

    private xDomain(): [number, number]{
        return [Math.floor(Math.min(...this.data().map(d=>d.x))), this.props.config?.mergeDomainMaxValue ? Math.ceil(this.props.config?.mergeDomainMaxValue) : Math.ceil(Math.max(...this.data().map(d=>d.x)))]
    }


    private tickValues(): number[] | undefined {
        if(this.props.config?.tickIncrement){
            const tickValues: number[] = [];
            for(let i: number=this.props.config.tickIncrement.origin;i<=this.xDomain()[1];i+=this.props.config.tickIncrement.increment){
                tickValues.push(i);
            }
            return tickValues
        }
        return undefined;
    }

    render():ReactNode {
        const histData: {x:number;y:number}[] = this.data();
        const width: number = histData.length*40;
        const height: number = 250;
        return (
            <div style={{width:width, height:height}}>
                <VictoryChart
                    domainPadding={{ x: 10 }}
                    height={height}
                    width={width}
                    domain={{x:this.xDomain()}}
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
                        data={histData}
                    />
                    <VictoryAxis tickValues={this.tickValues()} tickFormat={(t) => {
                        if(this.props.config?.mergeDomainMaxValue){
                            if(parseFloat(t)<this.props.config.mergeDomainMaxValue)
                                return t;
                            else if(parseFloat(t) == this.props.config.mergeDomainMaxValue)
                                return `${t}+`;
                            else
                                return "";
                        }
                        return t;
                    }}/>
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
