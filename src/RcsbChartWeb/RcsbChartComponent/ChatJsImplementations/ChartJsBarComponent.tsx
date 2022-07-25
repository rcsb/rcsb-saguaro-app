import * as React from "react";

import {AbstractChartImplementation, AbstractChartImplementationInterface} from "../AbstractChartImplementation";
import {ChartDataInterface} from "../../RcsbChartDataProvider/ChartDataProviderInterface";
import {ChartDisplayConfigInterface} from "../ChartConfigInterface";
import uniqid from "uniqid";
import Chart from 'chart.js/auto';

export class ChartJsBarComponent extends AbstractChartImplementation {

    private readonly canvasId: string = uniqid("canvas_");
    private canvas: HTMLCanvasElement;
    private chart: Chart<"bar",number[],string>;

    render():JSX.Element {
        const {data}: { data: ChartDataInterface[]; excludedData?: ChartDataInterface[]; } = this.props.dataProvider.getChartData();
        const displayConfig: Partial<ChartDisplayConfigInterface> = this.props.chartConfig.chartDisplayConfig
        return (<canvas id={this.canvasId} width={this.props.width} height={this.props.height}></canvas>);
    }

    componentDidMount() {
        const {data}: { data: ChartDataInterface[]; excludedData?: ChartDataInterface[]; } = this.props.dataProvider.getChartData();
        this.canvas = document.getElementById(this.canvasId) as HTMLCanvasElement;
        const ctx: CanvasRenderingContext2D = this.canvas.getContext('2d');
        this.chart = new Chart<"bar",number[],string>(ctx,{
            type: 'bar',
            data: getChartJsData(data),
            options:{
                indexAxis: 'y',
                scales: {
                    yAxes:{
                        afterFit: function(scaleInstance) {
                            scaleInstance.width = 150; // sets the width to 100px
                        }
                    },
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true
                    }
                }
            }
        });
    }

    shouldComponentUpdate(nextProps: Readonly<AbstractChartImplementationInterface>, nextState: Readonly<any>, nextContext: any): boolean {
        const {data}: { data: ChartDataInterface[]; excludedData?: ChartDataInterface[]; } = nextProps.dataProvider.getChartData();
        console.log(data);
        if(this.canvas.width != nextProps.width)
            this.canvas.width = nextProps.width
        if(this.canvas.height != nextProps.height) {
            this.canvas.height = nextProps.height
            this.canvas.style.height = nextProps.height.toString()+"px";
        }
        this.chart.data = getChartJsData(data);
        this.chart.update();
        return false;
    }

}

function getChartJsData(data: ChartDataInterface[]){
    return {
        labels: data.reverse().map(d=>d.x.toString()),
        datasets:[{
            data: data.map(d=>d.y),
            backgroundColor:"blue"
        },{
            data: data.map(d=>d.yc),
            backgroundColor:"grey"
        }]
    };
}