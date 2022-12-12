import {
    ChartDisplayConfigInterface,
    ChartObjectInterface
} from "../RcsbChartComponent/ChartConfigInterface";
import {ChartDataInterface} from "./ChartDataProviderInterface";

export class ChartTools {

    private static readonly paddingLeft: number = 150;
    private static readonly paddingTopLarge: number = 50;
    private static readonly paddingTop: number = 10;
    private static readonly paddingRight: number = 15;
    private static readonly constWidth: number = 350;
    private static readonly constHeight: number = 225;
    private static readonly xIncrement: number = 22;
    private static readonly xDomainPadding: number = 10;
    private static readonly barWidth: number = 10;
    private static readonly fontFamily: string = "\"Helvetica Neue\",Helvetica,Arial,sans-serif";
    private static readonly fontSize: number = 12;

    public static getConfig<T>(key: keyof ChartDisplayConfigInterface, chartDisplayConfig:Partial<ChartDisplayConfigInterface>): T {
        return ((chartDisplayConfig && (typeof chartDisplayConfig[key] === "string" || typeof chartDisplayConfig[key] === "number")) ? chartDisplayConfig[key] : this[key]) as unknown as T;
    }

    public static mergeDomainMaxValue(data: ChartDataInterface[], maxValue: number): ChartDataInterface[] {
        const out: ChartDataInterface[] =  data.filter(d => parseFloat(d.x as string) < maxValue).map(d => ({
            ...d,
            x: parseFloat(d.x as string),
            y: d.y
        }));
        const overflow = data.filter(d => parseFloat(d.x as string) >= maxValue);
        if(overflow?.length > 0){
            const others: number[] = overflow.reduce((prev, curr) => {
                if(prev.length == 0)
                    return curr.y.map(e=>e.value)
                else
                    return prev.map((v,n)=>v+curr.y[n].value)
            }, []);
            if(others.length > 0 && others.reduce((prev,curr)=>(prev+curr),0) > 0)
                out.push({
                    x:maxValue,
                    y: others.map((v,n)=>({value:v, color:overflow[0].y[n].color}))
                });
        }
        return out;
    }

    public static labelsAsNumber(data: ChartObjectInterface[][]): ChartObjectInterface[][]{
        return data.map(d=>d.map(e=>({
            ...e,
            label:parseFloat(e.label.toString())
        })));
    }

    public static labelsAsString(data: ChartObjectInterface[][]): ChartObjectInterface[][]{
        return data.map(d=>d.map(e=>({
            ...e,
            label:e.label.toString()
        })));
    }

    public static normalizeData(chartData: ChartObjectInterface[][]): ChartDataInterface[]{
        const dataMap: Map<string|number,ChartDataInterface> = new Map<string|number,ChartDataInterface>();
        chartData.flat().forEach(d=>{
            dataMap.set(d.label,{
                x:d.label,
                y:[],
                id:d.objectConfig?.objectId,
                isLabel:true
            });
        });
        chartData.forEach(dataGroup=>{
            Array.from(dataMap.keys()).forEach(key=>{
                const d: ChartObjectInterface = dataGroup.find(d=>d.label==key);
                dataMap.get(key).y.push({value:d?.population ?? 0, color: d?.objectConfig?.color});
            });
        });
        return Array.from(dataMap.values());
    }

}