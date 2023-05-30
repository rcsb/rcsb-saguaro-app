import {AbstractChartComponent} from "./AbsractChartComponent";
import React from "react";
import {ChartComponent} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartComponent";
import {
    VictoryBarChartComponent
} from "@rcsb/rcsb-charts/lib/RcsbChartImplementations/VictoryChartImplementations/VictoryBarChartComponent";
import {BarChartDataProvider} from "@rcsb/rcsb-charts/lib/RcsbChartDataProvider/BarChartDataProvider";
import {
    ChartJsBarComponent
} from "@rcsb/rcsb-charts/lib/RcsbChartImplementations/ChatJsImplementations/ChartJsBarComponent";

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