import * as React from "react";
import {ChartType} from "../../../RcsbChartWeb/RcsbChartComponent/ChartConfigInterface";
import {HistogramChartComponent} from "../../../RcsbChartWeb/RcsbChartComponent/HistogramChartComponent";
import {BarChartComponent} from "../../../RcsbChartWeb/RcsbChartComponent/BarChartComponent";
import {Col, Container, Row} from "react-bootstrap";
import {RcsbChartInterface} from "../../../RcsbSeacrh/FacetTools";
import {ChartTools} from "../../../RcsbChartWeb/RcsbChartTools/ChartTools";
import {
    VictoryBarChartComponent
} from "../../../RcsbChartWeb/RcsbChartComponent/VictoryChartImplementations/VictoryBarChartComponent";
import {
    VictoryHistogramChartComponent
} from "../../../RcsbChartWeb/RcsbChartComponent/VictoryChartImplementations/VictoryHistogramChartComponent";

export type ChartMapType = Map<string,{chart:RcsbChartInterface;subChart?:RcsbChartInterface;}>;
export interface RcsbChartLayoutInterface {
    layout: string[];
    chartMap: ChartMapType;
}

export class GroupChartLayout extends React.Component <RcsbChartLayoutInterface,{}> {

    constructor(props: RcsbChartLayoutInterface) {
        super(props);

    }

    render():JSX.Element {
        return (
            <Container fluid={"md"}>
                <Row className={"mt-md-5 mb-md-5"}>
                    {
                        this.props.layout.map((attr)=>this.renderCell(attr))
                    }
                </Row>
            </Container>
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
    return(<Col md={colSize}>
        <Row className={"mb-md-5"}>
            <Col md={12}>
                <Row className={"mb-md-2"}>
                    <Col md={12} style={{paddingLeft:ChartTools.paddingLeft + ChartTools.xDomainPadding}}><strong>{title}</strong></Col>
                </Row>
                <Row>
                    <Col md={12}>{chartNode}</Col>
                </Row>
            </Col>
        </Row>
    </Col>);
}

function histogramChart(attributeName: string, chart: RcsbChartInterface, subChart?:RcsbChartInterface): JSX.Element {
    return (<div id={`chart:${chart.labelList ? chart.labelList.join("-") + chart.attribute : chart.attribute}`} >
        <HistogramChartComponent data={chart.data} subData={subChart?.data} chartConfig={chart.chartConfig} attributeName={attributeName} chartComponentImplementation={VictoryHistogramChartComponent}/>
    </div>);
}

function barChart(attributeName: string, chart: RcsbChartInterface, subChart?:RcsbChartInterface): JSX.Element {
    return (<div id={`chart:${chart.labelList ? chart.labelList.join("-") + chart.attribute : chart.attribute}`} >
        <BarChartComponent data={chart.data} subData={subChart?.data} chartConfig={chart.chartConfig} attributeName={attributeName} chartComponentImplementation={VictoryBarChartComponent}/>
    </div>);
}
