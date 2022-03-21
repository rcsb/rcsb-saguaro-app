import {ChartObjectInterface, ChartViewInterface} from "./ChartViewInterface";
import * as React from "react";
import {
    SearchQueryContextManager as SQCM,
    SearchQueryContextManagerSubjectInterface
} from "../../RcsbGroupWeb/RcsbGroupView/RcsbGroupSeacrhQuery/SearchQueryContextManager";
import {asyncScheduler, Subscription} from "rxjs";
import {ChartTools} from "../RcsbChartTools/ChartTools";

interface AbstractChartViewInterface {
    data: ChartObjectInterface[];
    subData: ChartObjectInterface[];
}

export class AbstractObserverChartView extends React.Component <ChartViewInterface & {attributeName:string}, AbstractChartViewInterface> {

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
            this.setState({
                data:sqData.chartMap.get(this.props.attributeName).chart.data,
                subData:sqData.chartMap.get(this.props.attributeName).subChart?.data,
            });
        }else{
            if(this.asyncSubscription)
                this.asyncSubscription.unsubscribe();
            this.asyncSubscription = asyncScheduler.schedule(()=>{
                this.setState({
                    data:sqData.chartMap.get(this.props.attributeName).chart.data,
                    subData:sqData.chartMap.get(this.props.attributeName).subChart?.data,
                });
            },ChartTools.animationDuration)
        }
    }

}