import * as React from "react";
import {Col, Container, Row} from "react-bootstrap";
import {RcsbChartInterface} from "../../../RcsbSeacrh/FacetTools";

import uniqid from "uniqid";
import {
    ChartDisplayConfigInterface
} from "@rcsb/rcsb-charts/build/dist/RcsbChartComponent/ChartConfigInterface";
import {
    ChartType,
    ChartTools
} from "@rcsb/rcsb-charts";
import {HistogramChartComponent} from "../../../RcsbChartWeb/HistogramChartComponent";
import {BarChartComponent} from "../../../RcsbChartWeb/BarChartComponent";

export type ChartMapType = Map<string,RcsbChartInterface[]>;
export interface RcsbChartLayoutInterface {
    layout: string[];
    chartMap: ChartMapType;
}

export class GroupChartLayout extends React.Component <RcsbChartLayoutInterface,{}> {

    render():JSX.Element {
        return (
            <Container fluid={"md"}>
                <Row>
                    {
                        this.props.layout.map((attr)=>this.renderCell(attr))
                    }
                </Row>
            </Container>
        );
    }

    private renderCell(attr: string): JSX.Element {
        const chart: RcsbChartInterface[] = this.props.chartMap.get(attr);
        if(chart){
            const node: JSX.Element = chart[0].chartType == ChartType.histogram ? histogramChart(attr, chart) : barChart(attr, chart);
            return chartCell(node,chart[0].title, chart[0].chartConfig?.chartDisplayConfig);
        }
        return null;
    }

}

function chartCell(chartNode:JSX.Element, title: string, chartDisplayConfig:Partial<ChartDisplayConfigInterface>): JSX.Element{
    return(<Col key={`${title}_${uniqid()}`}>
        <Row className={"mb-md-5"}>
            <Col md={12}>
                <Row className={"mb-md-2"}>
                    <Col md={12} style={{paddingLeft:ChartTools.getConfig<number>("paddingLeft", chartDisplayConfig) + ChartTools.getConfig<number>("xDomainPadding", chartDisplayConfig)}}><strong>{title}</strong></Col>
                </Row>
                <Row>
                    <Col md={12}>{chartNode}</Col>
                </Row>
            </Col>
        </Row>
    </Col>);
}

function histogramChart(attributeName: string, chart: RcsbChartInterface[]): JSX.Element {
    return (<div id={`chart:${chart[0].labelList ? chart[0].labelList.join("-") + chart[0].attribute : chart[0].attribute}`} >
        <HistogramChartComponent
            data={chart.map(c=>c.data)}
            chartConfig={chart[0].chartConfig}
            attributeName={attributeName}
        />
    </div>);
}

function barChart(attributeName: string, chart: RcsbChartInterface[]): JSX.Element {
    return (<div id={`chart:${chart[0].labelList ? chart[0].labelList.join("-") + chart[0].attribute : chart[0].attribute}`} >
        <BarChartComponent
            data={chart.map(c=>c.data)}
            chartConfig={chart[0].chartConfig}
            attributeName={attributeName}
        />
    </div>);
}
