import * as React from "react";
import {ChartType} from "./ChartViewInterface";
import {HistogramChartView} from "./HistogramChartView";
import {BarChartView} from "./BarChartView";
import {Container, Row, Col} from "react-bootstrap";
import {RcsbChartInterface} from "../../RcsbSeacrh/FacetTools";
export interface RcsbChartLayoutInterface {
    layout: [string,string?][];
    charts: RcsbChartInterface[];
    subCharts?: RcsbChartInterface[];
}

export class RcsbChartLayout extends React.Component <RcsbChartLayoutInterface,RcsbChartLayoutInterface> {

    readonly state: RcsbChartLayoutInterface = {...this.props};
    constructor(props: RcsbChartLayoutInterface) {
        super(props);
    }

    render():JSX.Element {
        return (
            <>
                {
                    this.props.layout.map(([attrF,attrG])=>this.renderRow(attrF,attrG))
                }
            </>
        );
    }

    private renderRow(attrF: string, attrG: string): JSX.Element {
        const chartF: RcsbChartInterface = this.state.charts.filter(f=>f.attribute == attrF)[0];
        const subF: RcsbChartInterface = this.state.subCharts?.filter(f=>f.attribute == attrF)[0];
        const chartG: RcsbChartInterface = attrG ? this.state.charts.filter(g=>g.attribute == attrG)[0] : undefined;
        const subG: RcsbChartInterface = attrG ? this.state.subCharts?.filter(g=>g.attribute == attrG)[0] : undefined;
        if(chartF && chartG){
            const nodeF: JSX.Element =  chartF.chartType == ChartType.histogram ? histogramChart(chartF, subF) : barChart(chartF, subF);
            const nodeG: JSX.Element =  chartG.chartType == ChartType.histogram ? histogramChart(chartG, subG) : barChart(chartG, subG);
            return (
                <Row className={"mt-lg-4"}>
                    {chartCell(nodeF, chartF.title)}
                    {chartCell(nodeG, chartG.title)}
                </Row>
            );
        }else if(chartF || chartG){
            return chartF ? singleChartCell(chartF, subF) : singleChartCell(chartG, subG);
        }
    }

}

function singleChartCell(chart: RcsbChartInterface, subChart?:RcsbChartInterface): JSX.Element {
    const nodeF: JSX.Element =  chart.chartType == ChartType.histogram ? histogramChart(chart, subChart) : barChart(chart, subChart);
    return (
        <Row className={"mt-lg-4"}>
            {chartCell(nodeF, chart.title)}
        </Row>
    );
}

function histogramChart(chart: RcsbChartInterface, subChart?:RcsbChartInterface): JSX.Element {
    return (<div id={`chart:${chart.labelList ? chart.labelList.join("-") + chart.attribute : chart.attribute}`} >
        <HistogramChartView data={chart.data} subData={subChart?.data} config={chart.chartConfig}/>
    </div>);
}

function barChart(chart: RcsbChartInterface, subChart?:RcsbChartInterface): JSX.Element {
    return (<div id={`chart:${chart.labelList ? chart.labelList.join("-") + chart.attribute : chart.attribute}`} >
        <BarChartView data={chart.data} subData={subChart?.data} config={chart.chartConfig}/>
    </div>);
}

function chartCell(chartNode:JSX.Element, title: string): JSX.Element{
    return(<Col lg={6} >
        <Row className={"h-100 align-items-end"}>
            <Row className={"align-self-start mb-lg-2"}>
                <Col lg={12} style={{paddingLeft:210}}>{title}</Col>
            </Row>
            <Row>
                <Col lg={12}>{chartNode}</Col>
            </Row>
        </Row>
    </Col>);
}