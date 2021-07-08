import * as React from "react";
import {ChartConfigInterface, ChartType} from "../RcsbChartView/ChartViewInterface";
import {HistogramChartView} from "../RcsbChartView/HistogramChartView";
import {BarChartView} from "../RcsbChartView/BarChartView";

export interface RcsbChartLayoutInterface {
    charts: RcsbChartInterface[];
}

export interface RcsbChartInterface {
    chartType: ChartType;
    propertyName: string;
    chartConfig?: ChartConfigInterface,
    data: {
        label: string|number;
        population: number;
    }[];
}

export class RcsbChartLayout extends React.Component <RcsbChartLayoutInterface,RcsbChartLayoutInterface> {

    readonly state: RcsbChartLayoutInterface = {...this.props};
    constructor(props: RcsbChartLayoutInterface) {
        super(props);
    }

    render():JSX.Element {
        return (
            <div id={"RcsbChartLayout"} >
                {
                    this.state.charts.map(chartProperty=> {
                        if(chartProperty.chartType === ChartType.histogram){
                            return RcsbChartLayout.histogramChart(chartProperty);
                        }else if(chartProperty.chartType === ChartType.barplot){
                            return RcsbChartLayout.barChart(chartProperty);
                        }
                    })
                }
            </div>
        );
    }

    private static histogramChart(chart: RcsbChartInterface): JSX.Element {
        return (<div id={`chart:${chart.propertyName}`} >
            <HistogramChartView data={chart.data} config={chart.chartConfig}/>
        </div>);
    }

    private static barChart(chart: RcsbChartInterface): JSX.Element {
        return (<div id={`chart:${chart.propertyName}`} >
            <BarChartView data={chart.data} config={chart.chartConfig}/>
        </div>);
    }

}
