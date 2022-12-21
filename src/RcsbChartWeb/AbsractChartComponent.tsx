import {asyncScheduler, Subscription} from "rxjs";
import {ChartObjectInterface} from "@rcsb/rcsb-charts/build/dist/RcsbChartComponent/ChartConfigInterface";
import React from "react";
import {
    ChartInterface,
    ChartState
} from "@rcsb/rcsb-charts/build/dist/RcsbChartComponent/ChartComponent";
import {SearchQueryContextManager} from "../RcsbGroupWeb/RcsbGroupView/RcsbGroupSeacrhQuery/SearchQueryContextManager";

interface ObservedDataInterface {
    attributeName: string;
    chartMap:Map<string,ChartObjectInterface[][]>;
}

interface AbstractChartInterface extends Omit<ChartInterface, "chartComponentImplementation" | "dataProvider"> {
    attributeName:string;
}

interface AbstractChartState extends ChartState {
    data: ChartObjectInterface[][];
}

export abstract class AbstractChartComponent extends React.Component <AbstractChartInterface, AbstractChartState> {
    private asyncSubscription: Subscription;
    private subscription: Subscription;

    readonly state: AbstractChartState = {
        data: this.props.data,
        chartConfig: this.props.chartConfig
    }

    componentDidMount() {
        this.subscribe();
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    private unsubscribe(): void {
        this.subscription.unsubscribe();
    }

    private subscribe(): void{
        this.subscription = SearchQueryContextManager.dataSubscription(
            (o:ObservedDataInterface)=>{
                this.updateChartMap(o);
            },
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
        this.asyncSubscription.unsubscribe();
        this.asyncSubscription = asyncScheduler.schedule(()=>{
            this.setState({
                data:sqData.chartMap.get(this.props.attributeName)
            });
        }, x );
    }

}