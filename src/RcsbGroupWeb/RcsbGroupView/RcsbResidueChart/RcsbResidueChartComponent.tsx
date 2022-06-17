import * as React from "react";
import {ChartMapType, GroupChartLayout} from "../RcsbGroupChart/GroupChartLayout";
import {ResidueChartInterface, ResidueChartTools as RCT} from "./ResidueChartTools";
import classes from "../RcsbGroupMembers/Components/scss/group-display.module.scss";
import {Container} from "react-bootstrap";
import {RcsbChartInterface} from "../../../RcsbSeacrh/FacetTools";

interface RcsbResidueChartState {
    layout: string[];
    chartMap: ChartMapType;
}

export class RcsbResidueChartComponent extends React.Component <ResidueChartInterface, RcsbResidueChartState> {

    render(): JSX.Element {
        if (this.state?.layout?.flat().filter((e) => (this.state?.chartMap?.get(e)))) {
            return (<div className={classes.bootstrapGroupComponentScope}>
                <Container fluid={"md"}>
                    <GroupChartLayout
                        layout={this.state.layout}
                        chartMap={this.state.chartMap}
                    />
                </Container>
            </div>);
        }
        return null;
    }

    async componentDidMount(): Promise<void> {
        await this.updateState();
    }

    private async updateState(): Promise<void> {
        const charts: RcsbChartInterface[] = await RCT.getResidueDistribution(this.props);
        this.setState({
            layout: charts.map(c=>c.attribute),
            chartMap: charts.reduce<ChartMapType>((prev,curr)=>(prev.set(curr.attribute,{chart: curr})), new Map())
        });
    }

}