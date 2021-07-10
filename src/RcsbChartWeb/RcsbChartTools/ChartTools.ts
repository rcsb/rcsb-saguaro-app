import {ChartObjectInterface} from "../RcsbChartView/ChartViewInterface";

export class ChartTools {

    public static readonly paddingLeft: number = 200;
    public static readonly paddingBottom: number = 50;
    public static readonly constWidth: number = 300;
    public static readonly constHeight: number = 200;
    public static readonly xIncrement: number = 20;
    public static readonly xDomainPadding: number = 10;
    public static readonly barWidth: number = 10;

    public static mergeGroupSize(data: ChartObjectInterface[], size: number, mergeName?: string): {x:string;y:number;}[]{
        const out: {x:string;y:number;}[] = data.filter(d=>( d.population>size)).map(d=>({
            x:d.label  as string,
            y:d.population
        }));
        out.push({
            x: mergeName ?? "Other",
            y: data.filter(d=>(d.population<=size)).length
        });
        return out;
    }

    public static mostPopulatedGroups (data: ChartObjectInterface[], maxGroups: number, mergeName?: string): {x:string;y:number;}[]{
        const sorted :ChartObjectInterface[] = data.sort((a,b)=>(b.population-a.population));

        const out: {x:string;y:number;}[] =  sorted.slice(0,maxGroups).map(d=>({
            x:d.label  as string,
            y:d.population
        }));
        out.push({
            x:mergeName ?? "Other",
            y:sorted.slice(maxGroups).reduce((a, b) => a + b.population, 0)
        });
        return out;
    }

    public static mergeDomainMaxValue(data: ChartObjectInterface[], maxValue: number): {x:number;y:number;}[]{
        const out: {x:number;y:number;}[] =  data.filter(d => parseFloat(d.label as string) < maxValue).map(d => ({
            x: parseFloat(d.label as string),
            y: d.population
        }));
        out.push({
            x:maxValue,
            y:data.filter(d => parseFloat(d.label as string) >= maxValue).reduce((a, b) => a + b.population, 0)
        });
        return out;
    }

    public static labelsAsString(data: ChartObjectInterface[]): {x:string;y:number;}[]{
        return data.map(d=>({
            x:d.label  as string,
            y:d.population
        }));
    }

    public static labelsAsNumber(data: ChartObjectInterface[]): {x:number;y:number;}[]{
        return data.map(d=>({x: parseFloat(d.label as string), y:d.population}));
    }
}