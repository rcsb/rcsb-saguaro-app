import {ChartDataProviderInterface} from "./ChartDataProviderInterface";
import {ChartConfigInterface, ChartObjectInterface} from "../RcsbChartComponent/ChartConfigInterface";
import {ChartTools} from "../RcsbChartTools/ChartTools";
import {ChartDataInterface} from "./ChartDataInterface";

export class HistogramChartData implements ChartDataProviderInterface{

    private config: ChartConfigInterface;
    private data: ChartDataInterface[];
    private chartSubData: ChartObjectInterface[];
    private chartData: ChartObjectInterface[];

    public setData(chartData: ChartObjectInterface[], chartSubData: ChartObjectInterface[], config: ChartConfigInterface):void {
        this.chartData = chartData;
        this.chartSubData = chartSubData;
        this.config = config;
        const barData: ChartDataInterface[] = this.transformData(chartData)
        const subData: ChartDataInterface[] = this.transformData(chartSubData)
        const mergedDomain: Set<number> = new Set<number>( barData.map(d=>d.x as number).concat(subData.map(d=>d.x as number)) );
        const barDomain: Set<number> = new Set<number>( barData.map(d=>d.x as number) );
        const subDomain: Set<number> = new Set<number>( subData.map(d=>d.x as number) );
        mergedDomain.forEach(x=>{
            if(!subDomain.has(x))
                subData.push({x:x,y:0,isLabel:true})
            if(!barDomain.has(x))
                barData.push({x:x,y:0,isLabel:true});
        });
        ChartTools.addComplementaryData(barData,subData);
        this.data = barData;
    }

    public getChartData(): { data: ChartDataInterface[]; } {
        return {data: this.data};
    }

    public xDomain(): [number, number]{
        return [
            this.config.domainMinValue ?? Math.floor(Math.min(...this.transformData(this.chartData).map(d=>d.x as number),...this.transformData(this.chartSubData).map(d=>d.x as number))),
            this.config?.mergeDomainMaxValue ?
                Math.ceil(this.config?.mergeDomainMaxValue+this.config.histogramBinIncrement)
                :
                Math.ceil(Math.max(...this.transformData(this.chartData).map(d=>d.x as number),...this.transformData(this.chartSubData).map(d=>d.x as number))+this.config.histogramBinIncrement)
        ]
    }

    public tickValues(): number[] | undefined {
        if(this.config?.tickIncrement){
            const tickValues: number[] = [];
            for(let i: number=this.config.tickIncrement.origin;i<=this.xDomain()[1];i+=this.config.tickIncrement.increment){
                tickValues.push(i);
            }
            return tickValues
        }
        return undefined;
    }

    private transformData(data: ChartObjectInterface[]): ChartDataInterface[]{
        if(!data)
            return [];
        let out: {x:number;y:number}[] = [];
        if(this.config?.mergeDomainMaxValue) {
            out = ChartTools.mergeDomainMaxValue(data, this.config.mergeDomainMaxValue);
        }else{
            out = ChartTools.labelsAsNumber(data);
        }
        return out.map(d=>({x:d.x+this.config.histogramBinIncrement*0.5,y:d.y, isLabel:true}));
    }

}