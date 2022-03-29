import {ChartObjectInterface, ChartViewInterface} from "./ChartViewInterface";
import * as React from "react";
import {
    SearchQueryContextManager as SQCM,
    SearchQueryContextManagerSubjectInterface
} from "../../RcsbGroupWeb/RcsbGroupView/RcsbGroupSeacrhQuery/SearchQueryContextManager";
import {asyncScheduler, Subscription} from "rxjs";

interface AbstractChartViewInterface {
    data: ChartObjectInterface[];
    subData: ChartObjectInterface[];
}

export class AbstractChartComponent extends React.Component <ChartViewInterface & {attributeName:string}, AbstractChartViewInterface> {

    private asyncSubscription: Subscription;
    private subscription: Subscription;

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