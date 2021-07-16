import * as React from "react";
import {VictoryAxis, VictoryBar, VictoryChart, VictoryContainer} from "victory";
import {ReactNode} from "react";
import {ChartViewInterface} from "./ChartViewInterface";
import {ChartTools} from "../RcsbChartTools/ChartTools";


export class HistogramChartView extends React.Component <ChartViewInterface,ChartViewInterface> {

    readonly state: ChartViewInterface = {...this.props};

    constructor(props: ChartViewInterface) {
        super(props);
    }

    private data(): {x:number;y:number}[]{
        let data: {x:number;y:number}[] = [];
        if(this.props.config?.mergeDomainMaxValue) {
            data = ChartTools.mergeDomainMaxValue(this.state.data, this.props.config.mergeDomainMaxValue);
        }else{
            data = ChartTools.labelsAsNumber(this.state.data);
        }
        return data;
    }

    private xDomain(): [number, number]{
        return [
            this.props.config.domainMinValue ?? Math.floor(Math.min(...this.data().map(d=>d.x))),
            this.props.config?.mergeDomainMaxValue ? Math.ceil(this.props.config?.mergeDomainMaxValue) : Math.ceil(Math.max(...this.data().map(d=>d.x)))
        ]
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
        const paddingLeft: number = ChartTools.paddingLeft;
        const width: number = paddingLeft + ChartTools.constWidth;
        const height: number = ChartTools.constHeight;
        const paddingBottom: number = ChartTools.paddingBottom;

        return (
            <div style={{width:width, height:height}}>
                <VictoryChart
                    padding={{left:paddingLeft, bottom:paddingBottom}}
                    height={height}
                    width={width}
                    domain={{x:this.xDomain()}}
                >
                    <VictoryBar
                        barWidth={ChartTools.barWidth}
                        style={{
                            data: {
                                fill: "#5e94c3",
                                stroke: "#325880",
                                strokeWidth: 1
                            }
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
