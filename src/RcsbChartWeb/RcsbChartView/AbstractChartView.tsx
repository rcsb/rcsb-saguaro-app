import {ChartObjectInterface, ChartViewInterface} from "./ChartViewInterface";
import * as React from "react";
import {
    SearchQueryContextManager as SQCM,
    SearchQueryContextManagerSubjectInterface
} from "../../RcsbGroupWeb/RcsbGroupView/RcsbGroupDisplay/SearchQueryContextManager";
import {asyncScheduler} from "rxjs";
import {ChartTools} from "../RcsbChartTools/ChartTools";

interface AbstractChartViewInterface {
    data: ChartObjectInterface[];
    subData: ChartObjectInterface[];
}

export class AbstractChartView extends React.Component <ChartViewInterface & {attributeName:string}, AbstractChartViewInterface> {

    protected subscribe(): void{
        SQCM.subscribe(
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
            asyncScheduler.schedule(()=>{
                this.setState({
                    data:sqData.chartMap.get(this.props.attributeName).chart.data,
                    subData:sqData.chartMap.get(this.props.attributeName).subChart?.data,
                });
            },ChartTools.animationDuration)
        }
    }

}