import {ChartDataInterface} from "./ChartDataInterface";
import {ChartConfigInterface, ChartObjectInterface} from "../RcsbChartView/ChartViewInterface";
import {BarData} from "../RcsbChartTools/EventBarComponent";
import {ChartTools} from "../RcsbChartTools/ChartTools";

export class HistogramChartData implements ChartDataInterface{

    readonly config: ChartConfigInterface;
    readonly data: ChartObjectInterface[];
    readonly subData: ChartObjectInterface[];

    constructor(data: ChartObjectInterface[], subData: ChartObjectInterface[], config: ChartConfigInterface) {
        this.data = data;
        this.subData = subData;
        this.config = config;
    }

    public getChartData(): { barData: BarData[]; subData: BarData[] } {
        const barData: BarData[] = this.transformData(this.data)
        const subData: BarData[] = this.transformData(this.subData)
        ChartTools.addComplementaryData(barData,subData);
        return {barData: barData, subData: subData};
    }

    public xDomain(): [number, number]{
        return [
            this.config.domainMinValue ?? Math.floor(Math.min(...this.transformData(this.data).map(d=>d.x as number),...this.transformData(this.subData).map(d=>d.x as number))),
            this.config?.mergeDomainMaxValue ?
                Math.ceil(this.config?.mergeDomainMaxValue+this.config.histogramBinIncrement)
                :
                Math.ceil(Math.max(...this.transformData(this.data).map(d=>d.x as number),...this.transformData(this.subData).map(d=>d.x as number))+this.config.histogramBinIncrement)
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

    private transformData(data: ChartObjectInterface[]): BarData[]{
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