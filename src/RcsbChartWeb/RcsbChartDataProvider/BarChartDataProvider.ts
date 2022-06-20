import {ChartConfigInterface, ChartObjectInterface} from "../RcsbChartComponent/ChartConfigInterface";
import {ChartTools} from "../RcsbChartTools/ChartTools";
import {ChartDataProviderInterface,ChartDataInterface} from "./ChartDataProviderInterface";

export class BarChartDataProvider implements ChartDataProviderInterface{

    private stringTicks: string[];
    private excludedData: ChartDataInterface[];
    private data: ChartDataInterface[];

    public setData(chartData: ChartObjectInterface[], chartSubData: ChartObjectInterface[], config?: ChartConfigInterface):void {
        const data: ChartDataInterface[] = ChartTools.labelsAsString(chartData);
        const subData: ChartDataInterface[] = chartSubData ? ChartTools.labelsAsString(chartSubData) : [];

        const mergedValues: Map<string|number, number> = new Map<string, number>();
        const subValues: Map<string|number, number> = new Map<string, number>();
        subData.forEach((d)=>{
            mergedValues.set(d.x,0);
            subValues.set(d.x,d.y);
        });
        data.forEach((d)=>{
            mergedValues.set(d.x,d.y);
        });
        const categories: Map<string|number,{x:string;id:string;}> = data.reduce((prev,curr)=>(prev.set(curr.x,curr)), new Map());
        const subCategories: Map<string|number,{x:string;id:string;}> = subData.reduce((prev,curr)=>(prev.set(curr.x,curr)), new Map());
        subCategories.forEach(c=>{
            if(!categories.has(c.x))
                data.push({x:c.x, y:0, id: c.id, isLabel:true});
        });
        categories.forEach(c=>{
            if(!subCategories.has(c.x))
                subData.push({x:c.x, y:0, id: c.id, isLabel:true});
        });
        const allowedCategories: Set<string|number> = new Set<string|number>([...mergedValues.entries()]
            .sort((a,b)=>(b[1]-a[1]))
            .slice(0,config?.mostPopulatedGroups ?? mergedValues.size)
            .map(e=>e[0]));

        const sort = config.sort ?? ((b: ChartDataInterface, a: ChartDataInterface) => {
            if(mergedValues.get(b.x) != mergedValues.get(a.x))
                return mergedValues.get(b.x)-mergedValues.get(a.x);
            else if(mergedValues.get(b.x) > 0)
                return a.x.toString().localeCompare(b.x.toString())
            else
                return subValues.get(b.x)-subValues.get(a.x);
        });
        const barOut: ChartDataInterface[] = data.sort((a, b)=>sort(a,b)).filter(d=>(allowedCategories.has(d.x)));
        const subOut: ChartDataInterface[] = subData.sort((a, b)=>sort(a,b)).filter(d=>(allowedCategories.has(d.x)));
        ChartTools.addComplementaryData(barOut,subOut);
        this.stringTicks = barOut.map(d=>d.x as string);
        this.excludedData = data.filter(d=>(!allowedCategories.has(d.x)));
        this.data = barOut;
    }

    public getChartData(): {data: ChartDataInterface[]; excludedData: ChartDataInterface[];}{
        return {
            data: this.data,
            excludedData: this.excludedData
        };
    }

    public tickValues(): string[] {
        return this.stringTicks;
    }

    xDomain(): undefined {
        return;
    }

}