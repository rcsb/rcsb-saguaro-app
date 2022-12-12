import {ChartDataProviderInterface, ChartDataInterface} from "./ChartDataProviderInterface";
import {ChartConfigInterface, ChartObjectInterface} from "../RcsbChartComponent/ChartConfigInterface";
import {ChartTools} from "./ChartTools";

export class HistogramChartDataProvider implements ChartDataProviderInterface{

    private config: ChartConfigInterface;
    private data: ChartDataInterface[];

    public setData(chartData: ChartObjectInterface[][], config?: ChartConfigInterface):void {
        this.config = config;
        const data: ChartDataInterface[] = ChartTools.normalizeData(ChartTools.labelsAsNumber(chartData));
        const barData: ChartDataInterface[] = this.transformData(data)
        this.data = barData.sort((r,s)=>((r.x as number)-(s.x as number)));
    }

    public getChartData(): { data: ChartDataInterface[]; } {
        return {data: this.data};
    }

    public xDomain(): [number, number]{
        return [
            this.config.domainMinValue ?? Math.floor(Math.min(...this.data.map(d=>d.x as number))),
            this.config?.mergeDomainMaxValue ?
                Math.ceil(this.config?.mergeDomainMaxValue+this.config.histogramBinIncrement)
                :
                Math.ceil(Math.max(...this.data.map(d=>d.x as number))+this.config.histogramBinIncrement)
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

    private transformData(data: ChartDataInterface[]): ChartDataInterface[]{
        if(!data)
            return [];
        let out: ChartDataInterface[] = data;
        if(this.config?.mergeDomainMaxValue) {
            out = ChartTools.mergeDomainMaxValue(data, this.config.mergeDomainMaxValue);
        }
        return out.map(d=>({x:(d.x as number)+this.config.histogramBinIncrement*0.5,y:d.y, isLabel:true}));
    }

}