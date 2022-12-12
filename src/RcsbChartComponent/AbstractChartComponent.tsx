import {ChartConfigInterface, ChartObjectInterface} from "./ChartConfigInterface";
import * as React from "react";

import {asyncScheduler, Subscription} from "rxjs";
import {ChartDataProviderInterface} from "../RcsbChartDataProvider/ChartDataProviderInterface";
import {AbstractChartImplementationType} from "./AbstractChartImplementation";

interface AbstractChartInterface {
    data: ChartObjectInterface[][];
    subscribe? (f:(x:ObservedDataInterface)=>void, attr?:string): Subscription
    chartConfig?:ChartConfigInterface;
    attributeName:string;
    chartComponentImplementation: AbstractChartImplementationType;
}

interface AbstractChartState {
    data: ChartObjectInterface[][];
    chartConfig:ChartConfigInterface;
}

interface ObservedDataInterface {
    attributeName: string;
    chartMap:Map<string,ChartObjectInterface[][]>;
}

export abstract class AbstractChartComponent extends React.Component <AbstractChartInterface, AbstractChartState> {

    protected readonly dataProvider: ChartDataProviderInterface;
    private asyncSubscription: Subscription;
    private subscription: Subscription;
    readonly state: AbstractChartState = {
        data: this.props.data,
        chartConfig: this.props.chartConfig
    };

    componentDidMount() {
        this.subscribe();
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    private unsubscribe(): void {
        this.subscription?.unsubscribe();
    }

    private subscribe(): void{
        this.subscription = this.props?.subscribe(
            (o:ObservedDataInterface)=>{
                this.updateChartMap(o);
            },
            this.props.attributeName
        );
    }

    private updateChartMap(sqData: ObservedDataInterface): void{
        if(!sqData.chartMap)
            return;
        if(this.props.attributeName === sqData.attributeName){
            this.asyncUpdate(sqData);
        }else{
            this.asyncUpdate(sqData,300)
        }
    }

    private asyncUpdate(sqData: ObservedDataInterface,x?:number): void {
        if(this.asyncSubscription)
            this.asyncSubscription.unsubscribe();
        this.asyncSubscription = asyncScheduler.schedule(()=>{
            this.setState({
                data:sqData.chartMap.get(this.props.attributeName)
            });
        }, x );
    }

}