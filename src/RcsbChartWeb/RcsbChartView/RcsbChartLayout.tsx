import * as React from "react";
import {ChartType} from "./ChartViewInterface";
import {HistogramChartView} from "./HistogramChartView";
import {BarChartView} from "./BarChartView";
import {Col, Row} from "react-bootstrap";
import {RcsbChartInterface} from "../../RcsbSeacrh/FacetTools";
import {ChartTools} from "../RcsbChartTools/ChartTools";

export type ChartMapType = Map<string,{chart:RcsbChartInterface;subChart?:RcsbChartInterface;}>;
export interface RcsbChartLayoutInterface {
    layout: string[];
    chartMap: ChartMapType;
}

export class RcsbChartLayout extends React.Component <RcsbChartLayoutInterface,{}> {

    constructor(props: RcsbChartLayoutInterface) {
        super(props);

    }

    render():JSX.Element {
        return (
            <Row className={"mt-lg-5 mb-lg-5"}>
                {
                    this.props.layout.map((attr)=>this.renderCell(attr))
                }
            </Row>
        );
    }

    private renderCell(attr: string): JSX.Element {
        const chart: RcsbChartInterface = this.props.chartMap.get(attr)?.chart;
        if(chart){
            const subChart: RcsbChartInterface = this.props.chartMap.get(attr).subChart;
            const node: JSX.Element = chart.chartType == ChartType.histogram ? histogramChart(attr, chart, subChart) : barChart(attr, chart, subChart);
            return chartCell(node,chart.title);
        }
        return null;
    }

}

function chartCell(chartNode:JSX.Element, title: string, colSize:number = 6): JSX.Element{
    return(<Col lg={colSize}>
        <Row className={"mb-lg-5"}>
            <Col lg={12}>
                <Row className={"mb-lg-2"}>
                    <Col lg={12} style={{paddingLeft:ChartTools.paddingLeft + ChartTools.xDomainPadding}}><strong>{title}</strong></Col>
                </Row>
                <Row>
                    <Col lg={12}>{chartNode}</Col>
                </Row>
            </Col>
        </Row>
    </Col>);
}

function histogramChart(attributeName: string, chart: RcsbChartInterface, subChart?:RcsbChartInterface): JSX.Element {
    return (<div id={`chart:${chart.labelList ? chart.labelList.join("-") + chart.attribute : chart.attribute}`} >
        <HistogramChartView data={chart.data} subData={subChart?.data} config={chart.chartConfig} attributeName={attributeName}/>
    </div>);
}

function barChart(attributeName: string, chart: RcsbChartInterface, subChart?:RcsbChartInterface): JSX.Element {
    return (<div id={`chart:${chart.labelList ? chart.labelList.join("-") + chart.attribute : chart.attribute}`} >
        <BarChartView data={chart.data} subData={subChart?.data} config={chart.chartConfig} attributeName={attributeName}/>
    </div>);
}
