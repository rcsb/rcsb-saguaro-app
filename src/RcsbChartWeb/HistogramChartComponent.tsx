import {AbstractChartComponent} from "./AbsractChartComponent";
import {ChartComponent} from "@rcsb/rcsb-charts/lib/RcsbChartComponent/ChartComponent";
import {HistogramChartDataProvider} from "@rcsb/rcsb-charts/lib/RcsbChartDataProvider/HistogramChartDataProvider";
import {
    ChartJsHistogramComponent
} from "@rcsb/rcsb-charts/lib/RcsbChartImplementations/ChatJsImplementations/ChartJsHistogramComponent";

export class HistogramChartComponent extends AbstractChartComponent {

    render(): JSX.Element {
        return (<ChartComponent
            data={this.state.data.map(d=>d.map(d=>({...d, label: (parseFloat(d.label.toString()) + (this.props.chartConfig?.histogramBinIncrement ?? 0)*0.5)})))}
            chartComponentImplementation={ChartJsHistogramComponent}
            dataProvider={new HistogramChartDataProvider()}
            chartConfig={this.props.chartConfig}
        />);
    }
}