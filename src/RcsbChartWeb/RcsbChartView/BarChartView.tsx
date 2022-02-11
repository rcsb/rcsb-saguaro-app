import * as React from "react";
import {Bar, VictoryAxis, VictoryBar, VictoryChart, VictoryStack} from "victory";
import {ReactNode} from "react";
import {ChartViewInterface} from "./ChartViewInterface";
import {ChartTools} from "../RcsbChartTools/ChartTools";
import {DynamicTickLabelComponent} from "../RcsbChartTools/DynamicTickLabelComponent";
import {BarClickCallbackType, EventBar, BarData} from "../RcsbChartTools/EventBar";

export class BarChartView extends React.Component <ChartViewInterface,ChartViewInterface> {

    readonly state: ChartViewInterface = {...this.props};

    constructor(props: ChartViewInterface) {
        super(props);
    }

    private dataByCategory(): {barData: BarData[]; subData: BarData[];}{
        const data: BarData[] = ChartTools.labelsAsString(this.state.data);
        const subData: BarData[] = this.state.subData ? ChartTools.labelsAsString(this.state.subData) : [];

        const mergedValues: Map<string|number, number> = new Map<string, number>();
        data.concat(subData).forEach((d)=>{
            if(mergedValues.has(d.x))
                mergedValues.set(d.x, mergedValues.get(d.x)+d.y)
            else
                mergedValues.set(d.x,d.y);
        });

        const categories: Set<string|number> = new Set(data.map(d=>d.x));
        const subCategories: Set<string|number> = new Set(subData.map(d=>d.x));
        subCategories.forEach(c=>{
            if(!categories.has(c))
                data.push({x:c, y:0, isLabel:true});
        });
        categories.forEach(c=>{
            if(!subCategories.has(c))
                subData.push({x:c, y:0, isLabel:true});
        });
        const allowedCategories: Set<string|number> = new Set<string|number>([...mergedValues.entries()]
            .sort((a,b)=>(b[1]-a[1]))
            .filter(d=>(d[1]>0))
            .slice(0,this.props.config?.mostPopulatedGroups ?? mergedValues.size)
            .map(e=>e[0]));

        const sort = (a: BarData, b: BarData) => {
            return mergedValues.get(b.x)-mergedValues.get(a.x);
        };
        const barOut: BarData[] = data.sort((a,b)=>sort(a,b)).filter(d=>(allowedCategories.has(d.x)));
        const barOther: number = data.filter(d=>(!allowedCategories.has(d.x))).reduce((N,d)=> N+d.y ,0);
        const subOut: BarData[] = subData.sort((a,b)=>sort(a,b)).filter(d=>(allowedCategories.has(d.x)));
        const subOther: number = subData.filter(d=>(!allowedCategories.has(d.x))).reduce((N,d)=> N+d.y ,0);
        if(barOther>0 || subOther>0){
            barOut.push({x:this.props.config?.mergeName, y:barOther, isLabel:false});
            subOut.push({x:this.props.config?.mergeName, y:subOther, isLabel:false});
        }
        return {
            barData: barOut,
            subData: subOut
        };
    }

    render():ReactNode {
        const {barData,subData}: {barData: BarData[]; subData: BarData[];} = this.dataByCategory();
        const width: number = ChartTools.paddingLeft + ChartTools.constWidth + ChartTools.paddingRight;
        const height: number = ChartTools.paddingBottom + barData.length*ChartTools.xIncrement;
        return (
            <div style={{width:width, height:height}}>
                <VictoryChart
                    domainPadding={{ x: ChartTools.xDomainPadding }}
                    padding={{left:ChartTools.paddingLeft, bottom:ChartTools.paddingBottom, right:ChartTools.paddingRight}}
                    height={height}
                    width={width}
                >
                    {CROSS_AXIS}
                    {stack(barData, subData,this.props.config.barClickCallback)}
                    <VictoryAxis  tickLabelComponent={<DynamicTickLabelComponent/>}/>
                </VictoryChart>
            </div>
        );
    }

}

const CROSS_AXIS = (<VictoryAxis
    dependentAxis={true}
    crossAxis={true}
    style={{
        grid: {
            stroke: "#999999",
            strokeDasharray: "1 3"
        }
    }}
/>);

function stack(histData:BarData[],subData:BarData[],barClick:BarClickCallbackType): JSX.Element{
    return ( <VictoryStack>
        {bar(histData, "#5e94c3", <EventBar barClick={barClick}/>)}
        {bar(subData, "#d0d0d0", <EventBar />)}
    </VictoryStack>);
}

function bar(data:BarData[],color: string, barComp?: JSX.Element): JSX.Element {
    return data.length > 0 ? (<VictoryBar
        barWidth={ChartTools.xDomainPadding}
        style={{
            data: {
                fill: color
            }
        }}
        horizontal={true}
        data={data}
        dataComponent={barComp ?? <Bar />}
    />)  : null;
}