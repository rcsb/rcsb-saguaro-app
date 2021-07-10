import * as React from "react";
import {ChartType} from "../RcsbChartView/ChartViewInterface";
import {HistogramChartView} from "../RcsbChartView/HistogramChartView";
import {BarChartView} from "../RcsbChartView/BarChartView";
import * as classes from "./scss/chart-display.module.scss";
import {Container, Row, Col} from "react-bootstrap";
import {FacetTools, RcsbChartInterface} from "../../RcsbSeacrh/FacetTools";
import {FacetStoreType} from "../../RcsbSeacrh/FacetStore/FacetStore";
export interface RcsbChartLayoutInterface {
    layout: [string,string?][];
    charts: RcsbChartInterface[];
}

export class RcsbChartLayout extends React.Component <RcsbChartLayoutInterface,RcsbChartLayoutInterface> {

    readonly state: RcsbChartLayoutInterface = {...this.props};
    constructor(props: RcsbChartLayoutInterface) {
        super(props);
    }

    render():JSX.Element {
        return (
            <div id={"RcsbChartLayout"} className={classes.chartLayoutComponentScope}>
                <Container fluid={"lg"}>
                {
                    this.props.layout.map(([attrF,attrG])=>{
                        if(attrG){
                            const chartF: RcsbChartInterface = this.state.charts.filter(f=>f.attribute == attrF)[0];
                            const chartG: RcsbChartInterface = this.state.charts.filter(g=>g.attribute == attrG)[0];
                            const nodeF: JSX.Element =  chartF.chartType == ChartType.histogram ? histogramChart(chartF) : barChart(chartF);
                            const nodeG: JSX.Element =  chartG.chartType == ChartType.histogram ? histogramChart(chartG) : barChart(chartG);
                            return (
                                <Row className={"mt-lg-4"}>
                                    {chartCell(nodeF, chartF.title)}
                                    {chartCell(nodeG, chartG.title)}
                                </Row>
                            );
                        }else{
                            const chartF: RcsbChartInterface = this.state.charts.filter(f=>f.attribute == attrF)[0];
                            const nodeF: JSX.Element =  chartF.chartType == ChartType.histogram ? histogramChart(chartF) : barChart(chartF);
                            return (
                                <Row className={"mt-lg-4"}>
                                    {chartCell(nodeF, chartF.title)}
                                </Row>
                            );
                        }

                    })
                }
                </Container>
            </div>
        );
    }

}

function histogramChart(chart: RcsbChartInterface): JSX.Element {
    return (<div id={`chart:${chart.labelList ? chart.labelList.join("-") + chart.attribute : chart.attribute}`} >
        <HistogramChartView data={chart.data} config={chart.chartConfig}/>
    </div>);
}

function barChart(chart: RcsbChartInterface): JSX.Element {
    return (<div id={`chart:${chart.labelList ? chart.labelList.join("-") + chart.attribute : chart.attribute}`} >
        <BarChartView data={chart.data} config={chart.chartConfig}/>
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