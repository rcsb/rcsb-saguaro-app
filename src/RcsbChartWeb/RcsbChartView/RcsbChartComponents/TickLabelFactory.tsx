import * as React from "react";
import {VictoryLabel, VictoryLabelProps} from "victory";
import {ChartTools} from "../../RcsbChartTools/ChartTools";

type LabelComponentType =  VictoryLabelProps & {stringTicks: string[]; index: number; height:number;};

//TODO This class breaks all the React best practices. Current Victory does not support animation in custom components. The factory adds dynamic on mouse hover text to VictoryLabel
export class TickLabelFactory {

    private static readonly THR: number = (ChartTools.paddingLeft + ChartTools.xDomainPadding)*0.75;
    private static readonly OVERFLOW_POSTFIX: " ..." = " ...";
    private static readonly WHITE: "#FFF" = "#FFF";
    private static readonly componentLabelMap: Map<string,{fullText: string; partialText: string; labelComponent: LabelComponentType;}> = new Map<string, {fullText: string; partialText: string; labelComponent: LabelComponentType;}>();

    public static getTickLabel(): JSX.Element{
        return (<VictoryLabel
            style={{fontSize:12,fontFamily:"\"Helvetica Neue\",Helvetica,Arial,sans-serif"}}
            events={{
                onMouseEnter:(evt)=>{
                    const element: SVGTSpanElement = (evt.target as SVGTSpanElement);
                    if(this.componentLabelMap.has(element.parentElement?.id)) {
                        (evt.target as SVGTSpanElement).textContent = this.componentLabelMap.get(element.parentElement?.id).fullText;
                        this.labelComponentBackgroundSize(evt.target as SVGTSpanElement);
                    }
                },
                onMouseLeave:(evt)=>{
                    const element: SVGTSpanElement = (evt.target as SVGTSpanElement);
                    if(this.componentLabelMap.has(element.parentElement?.id)) {
                        (evt.target as SVGTSpanElement).textContent = this.componentLabelMap.get(element.parentElement?.id).partialText;
                        this.labelComponentBackgroundSize(evt.target as SVGTSpanElement);
                    }
                }
            }}
            backgroundStyle={{
                fill: this.WHITE
            }}
            text={(labelComponent: unknown)=>{
                return this.formatLabel(labelComponent as LabelComponentType);
            }}
        />);
    }

    private static formatLabel(labelComponent: LabelComponentType): string {
        labelComponent.id = "tick-label-"+Math.random().toString(36).substring(2);
        const labelText: string = labelComponent.stringTicks[labelComponent.index];
        let text: string = labelText;
        if(this.displayTextWidth(text) > this.THR) {
            while (this.displayTextWidth(text, this.OVERFLOW_POSTFIX) > this.THR) {
                text = text.substring(0, text.length - 1);
            }
        }
        if(text !== labelText) {
            text += this.OVERFLOW_POSTFIX;
            labelComponent.textAnchor = "start";
            labelComponent.x = 0;
            labelComponent.dy = -2;
            this.componentLabelMap.set(labelComponent.id,{fullText:labelText, partialText:text, labelComponent:labelComponent});
        }
        return text;
    }

    private static displayTextWidth(text: string, suffix?: string): number {
        const canvas: HTMLCanvasElement = document.createElement<"canvas">("canvas");
        const context: CanvasRenderingContext2D = canvas.getContext("2d");
        let metrics = context.measureText(suffix ? text+suffix : text);
        return Math.ceil(metrics.width);
    }

    private static labelComponentBackgroundSize(e: SVGTSpanElement): void{
        const labelElement: HTMLElement = e.parentElement;
        const rect: SVGRectElement = labelElement.previousSibling as SVGRectElement;
        if (rect) {
            rect.setAttribute("width",(labelElement.getBoundingClientRect().width-1).toString());
            rect.setAttribute("height", labelElement.getBoundingClientRect().height.toString());
        }
    }

}
