import * as React from "react";
import {ChartType} from "./ChartViewInterface";
import {HistogramChartView} from "./HistogramChartView";
import {BarChartView} from "./BarChartView";
import {Col, Row} from "react-bootstrap";
import {RcsbChartInterface} from "../../RcsbSeacrh/FacetTools";

export type ChartMapType = Map<string,{chart:RcsbChartInterface;subChart?:RcsbChartInterface;}>;
export interface RcsbChartLayoutInterface {
    layout: [string,string?][];
    chartMap: ChartMapType;
}

export class RcsbChartLayout extends React.Component <RcsbChartLayoutInterface,{}> {

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
        return (
            <Row className={"mt-lg-4"}>
                {this.renderCell(attrF)}
                {this.renderCell(attrG)}
            </Row>
        );
    }

    private renderCell(attr: string): JSX.Element {
        const chart: RcsbChartInterface = this.props.chartMap.get(attr)?.chart;
        if(chart){
            const subChart: RcsbChartInterface = this.props.chartMap.get(attr).subChart;
            const node: JSX.Element = chart.chartType == ChartType.histogram ? histogramChart(chart, subChart) : barChart(chart, subChart);
            return chartCell(node,chart.title);
        }
        return null;
    }

}

function chartCell(chartNode:JSX.Element, title: string, colSize?:number): JSX.Element{
    return(<Col lg={colSize ?? 6} >
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
