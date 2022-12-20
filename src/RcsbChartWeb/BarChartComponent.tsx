import {AbstractChartComponent} from "./AbsractChartComponent";
import {BarChartDataProvider, ChartComponent, VictoryBarChartComponent} from "@rcsb/rcsb-charts";
import React from "react";

export class BarChartComponent extends AbstractChartComponent {

    render() {
        return (<ChartComponent
            data={this.state.data}
            chartComponentImplementation={VictoryBarChartComponent}
            dataProvider={ new BarChartDataProvider()}
            chartConfig={this.props.chartConfig}
        />);
    }
}