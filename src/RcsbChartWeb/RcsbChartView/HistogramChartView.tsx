import * as React from "react";
import {VictoryAxis, VictoryBar, VictoryChart, VictoryContainer, VictoryHistogram, VictoryStack} from "victory";
import {ReactNode} from "react";
import {ChartObjectInterface, ChartViewInterface} from "./ChartViewInterface";
import {ChartTools} from "../RcsbChartTools/ChartTools";


export class HistogramChartView extends React.Component <ChartViewInterface,ChartViewInterface> {

    readonly state: ChartViewInterface = {...this.props};

    constructor(props: ChartViewInterface) {
        super(props);
    }

    private data(data: ChartObjectInterface[]): {x:number;y:number}[]{
        if(!data)
            return [];
        let out: {x:number;y:number}[] = [];
        if(this.props.config?.mergeDomainMaxValue) {
            out = ChartTools.mergeDomainMaxValue(data, this.props.config.mergeDomainMaxValue);
        }else{
            out = ChartTools.labelsAsNumber(data);
        }
        return out.map(d=>({x:d.x+this.props.config.histogramBinIncrement*0.5,y:d.y}));
    }

    private xDomain(): [number, number]{
        return [
            this.props.config.domainMinValue ?? Math.floor(Math.min(...this.data(this.state.data).map(d=>d.x),...this.data(this.state.subData).map(d=>d.x))),
            this.props.config?.mergeDomainMaxValue ?
                Math.ceil(this.props.config?.mergeDomainMaxValue+this.props.config.histogramBinIncrement)
                :
                Math.ceil(Math.max(...this.data(this.state.data).map(d=>d.x),...this.data(this.state.subData).map(d=>d.x))+this.props.config.histogramBinIncrement)
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
        const histData: {x:number;y:number}[] = this.data(this.state.data);
        const subData: {x:number;y:number}[] = this.data(this.state.subData);
        const width: number = ChartTools.paddingLeft + ChartTools.constWidth + ChartTools.paddingRight;
        const dom = this.xDomain();
        const nBins: number = (dom[1]-dom[0])/this.props.config.histogramBinIncrement;
        return (
            <div style={{width:width, height:ChartTools.constHeight}}>
                <VictoryChart
                    padding={{left:ChartTools.paddingLeft, bottom:ChartTools.paddingBottom, top: ChartTools.paddingTop, right:ChartTools.paddingRight}}
                    height={ChartTools.constHeight}
                    width={width}
                    domain={{x:this.xDomain()}}
                >
                    {CROSS_AXIS}
                    <VictoryStack>
                        <VictoryBar
                            barWidth={(Math.ceil(ChartTools.constWidth/nBins)-3)}
                            alignment={"middle"}
                            style={{
                                data: {
                                    fill: "#5e94c3"
                                }
                            }}
                            data={histData}
                        />
                        <VictoryBar
                            barWidth={(Math.ceil(ChartTools.constWidth/nBins)-3)}
                            alignment={"middle"}
                            style={{
                                data: {
                                    fill: "#d0d0d0"
                                }
                            }}
                            data={subData}
                        />
                    </VictoryStack>
                    <VictoryAxis tickValues={this.tickValues()} tickFormat={(t) => {
                        if(this.props.config?.mergeDomainMaxValue){
                            if(parseFloat(t)<=this.props.config.mergeDomainMaxValue)
                                return t;
                            else
                                return "";
                        }
                        return t;
                    }}/>

                </VictoryChart>
            </div>
        );
    }

}

const CROSS_AXIS = (<VictoryAxis
    dependentAxis={true}
    crossAxis={true}
    style={{
        grid: {
            stroke: "#999999",
            strokeDasharray: "1 3"
        }
    }}
/>);
