import * as React from "react";
import {VictoryLabel, VictoryLabelProps} from "victory";
import {ChartTools} from "../../RcsbChartTools/ChartTools";

type LabelComponentType =  VictoryLabelProps & {stringTicks: string[]; index: number; height:number;};
export namespace TickLabelFactory {

    const THR: number = (ChartTools.paddingLeft + ChartTools.xDomainPadding)*0.75;
    const OVERFLOW_POSTFIX: " ..." = " ...";
    const WHITE: "#FFF" = "#FFF";
    const componentLabelMap: Map<string,{fullText: string; partialText: string; labelComponent: LabelComponentType;}> = new Map<string, {fullText: string; partialText: string; labelComponent: LabelComponentType;}>();

    export function getTickLabel(): JSX.Element{
        return (<VictoryLabel
            id = {()=>("tick-label-"+Math.random().toString(36).substring(2))}
            style={{fontSize:12,fontFamily:"\"Helvetica Neue\",Helvetica,Arial,sans-serif"}}
            events={{
                onMouseEnter:(evt)=>{
                    const text: string = (evt.target as SVGTSpanElement).textContent;
                    if(componentLabelMap.has(text)) {
                        (evt.target as SVGTSpanElement).textContent = componentLabelMap.get(text).fullText;
                        labelComponentBackgroundSize(evt.target as SVGTSpanElement);
                    }
                },
                onMouseLeave:(evt)=>{
                    const text: string = (evt.target as SVGTSpanElement).textContent;
                    if(componentLabelMap.has(text)) {
                        (evt.target as SVGTSpanElement).textContent = componentLabelMap.get(text).partialText;
                        labelComponentBackgroundSize(evt.target as SVGTSpanElement);
                    }
                }
            }}
            backgroundStyle={{
                fill: WHITE
            }}
            text={(labelComponent: unknown)=>{
                return formatLabel(labelComponent as LabelComponentType);
            }}
        />);
    }

    function formatLabel(labelComponent: LabelComponentType): string {
        const labelText: string = labelComponent.stringTicks[labelComponent.index];
        let text: string = labelText;
        if(displayTextWidth(text) > THR) {
            while (displayTextWidth(text, OVERFLOW_POSTFIX) > THR) {
                text = text.substring(0, text.length - 1);
            }
        }
        if(text !== labelText) {
            text += OVERFLOW_POSTFIX;
            labelComponent.textAnchor = "start";
            labelComponent.x = 0;
            labelComponent.dy = -2;
            componentLabelMap.set(text,{fullText:labelText, partialText:text, labelComponent:labelComponent});
            componentLabelMap.set(labelText,{fullText:labelText, partialText:text, labelComponent:labelComponent});
        }
        return text;
    }

    function displayTextWidth(text: string, suffix?: string): number {
        const canvas: HTMLCanvasElement = document.createElement<"canvas">("canvas");
        const context: CanvasRenderingContext2D = canvas.getContext("2d");
        let metrics = context.measureText(suffix ? text+suffix : text);
        return Math.ceil(metrics.width);
    }

    function labelComponentBackgroundSize(e: SVGTSpanElement): void{
        const labelElement: HTMLElement = e.parentElement;
        const rect: SVGRectElement = labelElement.previousSibling as SVGRectElement;
        if (rect) {
            rect.setAttribute("width",(labelElement.getBoundingClientRect().width-1).toString());
            rect.setAttribute("height", labelElement.getBoundingClientRect().height.toString());
        }
    }

}
