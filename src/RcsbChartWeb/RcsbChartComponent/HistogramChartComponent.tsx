import * as React from "react";
import {ChartTools} from "../RcsbChartDataProvider/ChartTools";
import {ChartDataProviderInterface} from "../RcsbChartDataProvider/ChartDataProviderInterface";
import {HistogramChartDataProvider} from "../RcsbChartDataProvider/HistogramChartDataProvider";
import {AbstractChartComponent} from "./AbstractChartComponent";
import {AbstractChartImplementationType} from "./AbstractChartImplementation";
import {ChartDisplayConfigInterface} from "./ChartConfigInterface";


export class HistogramChartComponent extends AbstractChartComponent {

    protected readonly dataProvider: ChartDataProviderInterface = new HistogramChartDataProvider();

    render():JSX.Element {
        this.dataProvider.setData(this.state.data,this.state.chartConfig);
        const displayConfig: Partial<ChartDisplayConfigInterface> = this.props.chartConfig.chartDisplayConfig;
        const width: number = ChartTools.getConfig<number>("paddingLeft", displayConfig) + ChartTools.getConfig<number>("constWidth", displayConfig) + ChartTools.getConfig<number>("paddingRight", displayConfig);
        const ChartComponent: AbstractChartImplementationType = this.props.chartComponentImplementation;
        const height: number = ChartTools.getConfig<number>("constHeight", displayConfig);
        return (
            <div style={{width:width}}>
                <ChartComponent width={width} height={height} chartConfig={this.props.chartConfig} dataProvider={this.dataProvider}/>
            </div>
        );
    }

}