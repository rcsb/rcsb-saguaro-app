import * as React from "react";
import {ChartMapType, GroupChartLayout} from "../RcsbGroupChart/GroupChartLayout";
import {ResidueChartInterface, ResidueChartTools as RCT} from "./ResidueChartTools/ResidueChartTools";
import classes from "../RcsbGroupMembers/Components/scss/bootstrap-display.module.scss";
import {FacetTools, RcsbChartInterface} from "../../../RcsbSeacrh/FacetTools";
import {ChartDisplayConfigInterface} from "../../../RcsbChartWeb/RcsbChartComponent/ChartConfigInterface";

interface RcsbResidueChartState {
    layout: string[];
    chartMap: ChartMapType;
}

export class RcsbResidueChartComponent extends React.Component <ResidueChartInterface & {facetLayoutGrid?:string[];chartDisplayConfig?: Partial<ChartDisplayConfigInterface>;}, RcsbResidueChartState> {

    render(): JSX.Element {
        if (this.state?.layout?.flat().filter((e) => (this.state?.chartMap?.get(e)))) {
            return (<div className={classes.bootstrapComponentScope}>
                <GroupChartLayout
                    layout={this.state.layout}
                    chartMap={this.state.chartMap}
                />
            </div>);
        }
        return null;
    }

    async componentDidMount(): Promise<void> {
        await this.updateState();
    }

    private async updateState(): Promise<void> {
        const charts: RcsbChartInterface[] = (await (await RCT.getResidueDistribution(this.props)))
            .filter(chart=>(!this.props.facetLayoutGrid || this.props.facetLayoutGrid.includes(chart.attribute)))
            .map(ch=>FacetTools.addChartDisplayConfig(ch, this.props.chartDisplayConfig ?? {}));
        this.setState({
            layout: charts.map(c=>c.attribute),
            chartMap: charts.reduce<ChartMapType>((prev,curr)=>(prev.set(curr.attribute,{chart: curr})), new Map())
        });
    }

}