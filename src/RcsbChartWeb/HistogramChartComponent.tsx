import {AbstractChartComponent} from "./AbsractChartComponent";
import {ChartComponent, HistogramChartDataProvider, VictoryHistogramChartComponent} from "@rcsb/rcsb-charts";
import React from "react";

export class HistogramChartComponent extends AbstractChartComponent {

    render(): JSX.Element {
        return (<ChartComponent
            data={this.state.data.map(d=>d.map(d=>({...d, label: (parseFloat(d.label.toString()) + this.props.chartConfig.histogramBinIncrement*0.5)})))}
            chartComponentImplementation={VictoryHistogramChartComponent}
            dataProvider={new HistogramChartDataProvider()}
            chartConfig={this.props.chartConfig}
        />);
    }
}