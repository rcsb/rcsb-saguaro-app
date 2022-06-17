import {ChartConfigInterface, ChartObjectInterface} from "./ChartConfigInterface";
import * as React from "react";
import {
    SearchQueryContextManager as SQCM,
    SearchQueryContextManagerSubjectInterface
} from "../../RcsbGroupWeb/RcsbGroupView/RcsbGroupSeacrhQuery/SearchQueryContextManager";
import {asyncScheduler, Subscription} from "rxjs";
import {ChartDataProviderInterface} from "../RcsbChartDataProvider/ChartDataProviderInterface";
import {AbstractChartImplementationType} from "./AbstractChartImplementation";

interface AbstractChartState {
    data: ChartObjectInterface[];
    subData: ChartObjectInterface[];
    chartConfig:ChartConfigInterface;
}

interface AbstractChartInterface {
    data: ChartObjectInterface[];
    subData?: ChartObjectInterface[];
    chartConfig?:ChartConfigInterface;
    attributeName:string;
    chartComponentImplementation: AbstractChartImplementationType;
}

export abstract class AbstractChartComponent extends React.Component <AbstractChartInterface, AbstractChartState> {

    protected readonly dataProvider: ChartDataProviderInterface;
    private asyncSubscription: Subscription;
    private subscription: Subscription;
    readonly state: AbstractChartState = {
        data: this.props.data,
        subData: this.props.subData,
        chartConfig: this.props.chartConfig
    };

    componentDidMount() {
        this.subscribe();
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    protected unsubscribe(): void {
        this.subscription.unsubscribe();
    }

    protected subscribe(): void{
        this.subscription = SQCM.subscribe(
            (o:SearchQueryContextManagerSubjectInterface)=>{
                this.updateChartMap(o);
            },
            this.props.attributeName
        );
    }

    private updateChartMap(sqData: SearchQueryContextManagerSubjectInterface): void{
        if(!sqData.chartMap.get(this.props.attributeName))
            return;
        if(this.props.attributeName === sqData.attributeName){
            this.asyncUpdate(sqData);
        }else{
            this.asyncUpdate(sqData,300)
        }
    }

    private asyncUpdate(sqData: SearchQueryContextManagerSubjectInterface,x?:number): void {
        if(this.asyncSubscription)
            this.asyncSubscription.unsubscribe();
        this.asyncSubscription = asyncScheduler.schedule(()=>{
            this.setState({
                data:sqData.chartMap.get(this.props.attributeName).chart.data,
                subData:sqData.chartMap.get(this.props.attributeName).subChart?.data,
            });
        }, x );
    }

}