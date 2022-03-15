import {ChartObjectInterface} from "../RcsbChartView/ChartViewInterface";
import {BarData} from "../RcsbChartView/RcsbChartComponents/BarComponent";

export class ChartTools {

    public static readonly paddingLeft: number = 150;
    public static readonly paddingTopLarge: number = 50;
    public static readonly paddingTop: number = 10;
    public static readonly paddingRight: number = 15;
    public static readonly constWidth: number = 350;
    public static readonly constHeight: number = 225;
    public static readonly xIncrement: number = 22;
    public static readonly xDomainPadding: number = 10;
    public static readonly barWidth: number = 10;

    public static readonly animationDuration: number = 600;

    public static mergeGroupSize(data: ChartObjectInterface[], size: number, mergeName?: string): {x:string;y:number;}[]{
        const out: {x:string;y:number;}[] = data.filter(d=>( d.population>size)).map(d=>({
            x:d.label  as string,
            y:d.population
        }));
        const others: number = data.filter(d=>(d.population<=size)).length;
        if(others > 0)
            out.push({
                x: mergeName ?? "Other",
                y: others
            });
        return out;
    }

    public static mostPopulatedGroups (data: ChartObjectInterface[], maxGroups: number, mergeName?: string): {x:string;y:number;}[]{
        const sorted :ChartObjectInterface[] = data.sort((a,b)=>(b.population-a.population));
        const out: {x:string;y:number;}[] =  sorted.slice(0,maxGroups).map(d=>({
            x:d.label  as string,
            y:d.population
        }));
        const others: number = sorted.slice(maxGroups).reduce((a, b) => a + b.population, 0);
        if(others > 0)
            out.push({
                x:mergeName ?? "Other",
                y:others
            });
        return out;
    }

    public static mergeDomainMaxValue(data: ChartObjectInterface[], maxValue: number): {x:number;y:number;}[]{
        const out: {x:number;y:number;}[] =  data.filter(d => parseFloat(d.label as string) < maxValue).map(d => ({
            x: parseFloat(d.label as string),
            y: d.population
        }));
        const others: number = data.filter(d => parseFloat(d.label as string) >= maxValue).reduce((a, b) => a + b.population, 0);
        if(others>0)
            out.push({
                x:maxValue,
                y:others
            });
        return out;
    }

    public static labelsAsString(data: ChartObjectInterface[]): BarData[]{
        return data.map(d=>({
            x:d.label as string,
            y:d.population,
            isLabel:true
        }));
    }

    public static labelsAsNumber(data: ChartObjectInterface[]): {x:number;y:number;}[]{
        return data.map(d=>({x: parseFloat(d.label as string), y:d.population}));
    }

    public static addComplementaryData(data: BarData[], subData: BarData[]): void{
        const dataMap: Map<string|number, number> = new Map<string | number, number>( data.map<[string|number,number]>((d)=>[d.x,d.y]) );
        const subMap: Map<string|number, number> = new Map<string | number, number>( subData.map<[string|number,number]>((d)=>[d.x,d.y]) );
        data.forEach((d=>{d.yc = subMap.get(d.x)}));
        subData.forEach((d=>{d.yc = dataMap.get(d.x)}));
    }
}