import {AbstractChartComponent} from "./AbsractChartComponent";
import React from "react";
import {ChartComponent} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartComponent";
import {
    VictoryHistogramChartComponent
} from "@rcsb/rcsb-charts/lib/RcsbChartImplementations/VictoryChartImplementations/VictoryHistogramChartComponent";
import {HistogramChartDataProvider} from "@rcsb/rcsb-charts/lib/RcsbChartDataProvider/HistogramChartDataProvider";

export class HistogramChartComponent extends AbstractChartComponent {

    render(): JSX.Element {
        return (<ChartComponent
            data={this.state.data.map(d=>d.map(d=>({...d, label: (parseFloat(d.label.toString()) + (this.props.chartConfig?.histogramBinIncrement ?? 0)*0.5)})))}
            chartComponentImplementation={VictoryHistogramChartComponent}
            dataProvider={new HistogramChartDataProvider()}
            chartConfig={this.props.chartConfig}
        />);
    }
}