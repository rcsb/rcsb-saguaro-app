import * as React from "react";
import {VictoryPie} from "victory";
import {ReactNode} from "react";
import {ChartViewInterface} from "./ChartViewInterface";

type pieData = {categories: string[];values:{x:string, y:number}[];};
export class PieChartView extends React.Component <ChartViewInterface,ChartViewInterface> {

    readonly state: ChartViewInterface = {...this.props};

    constructor(props: ChartViewInterface) {
        super(props);
    }

    private dataByCategory(): pieData{
        const categories: string[] = Array.from(new Set(this.state.data.map(d=>d.label as string)));
        const values: {x:string, y:number}[] = categories.map(c=>({
            x:c,
            y:this.state.data.filter(d=> d.label === c).length
        }));
        return {categories, values};
    }

    render():ReactNode {
        const pieData: pieData = this.dataByCategory()
        return (
            <VictoryPie categories={pieData.categories} data={pieData.values}/>
        );
    }

}
