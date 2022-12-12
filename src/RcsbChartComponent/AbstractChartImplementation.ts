import React from "react";
import {ChartDataReaderInterface} from "../RcsbChartDataProvider/ChartDataProviderInterface";
import {ChartConfigInterface} from "./ChartConfigInterface";

export interface AbstractChartImplementationInterface {
    height: number;
    width: number;
    dataProvider: ChartDataReaderInterface;
    chartConfig: ChartConfigInterface;
}

export abstract class AbstractChartImplementation extends React.Component<AbstractChartImplementationInterface, any>{}
export type AbstractChartImplementationType = typeof AbstractChartImplementation;