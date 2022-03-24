import * as React from "react";
import {VictoryLabel, VictoryLabelProps} from "victory";
import uniqid from 'uniqid';

import {LabelTextComponent} from "./LabelTextComponent";
import {ChartTools} from "../../RcsbChartTools/ChartTools";
import {LabelBackgroundComponent} from "./LabelBackgroundComponent";


export class LabelComponent extends React.PureComponent<VictoryLabelProps, null>{

    public static readonly THR: number = (ChartTools.paddingLeft + ChartTools.xDomainPadding)*0.75;
    public static readonly OVERFLOW_POSTFIX: " ..." = " ...";
    private static readonly BACKGROUND_COLOR: string = "#FFF";

    render():JSX.Element {
        const text: string = this.props.text as string;
        const collapsed: string = formatLabel(this.props.text as string);
        return (<VictoryLabel
            {...this.props}
            id={()=>("label-component-"+uniqid())}
            textComponent={<LabelTextComponent text={text} collapsed={collapsed}/>}
            backgroundComponent={<LabelBackgroundComponent />}
            backgroundStyle={{fill:LabelComponent.BACKGROUND_COLOR}}
        />);
    }

}

function formatLabel(text: string): string {
    let label: string = text;
    if(displayTextWidth(label) > LabelComponent.THR) {
        while (displayTextWidth(label,  LabelComponent.OVERFLOW_POSTFIX) > LabelComponent.THR) {
            label = label.substring(0, label.length - 1);
        }
    }
    if(label != text)
        label += LabelComponent.OVERFLOW_POSTFIX;
    return label;
}

function displayTextWidth(text: string, suffix?: string): number {
    const canvas: HTMLCanvasElement = document.createElement<"canvas">("canvas");
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    let metrics = context.measureText(suffix ? text+suffix : text);
    return Math.ceil(metrics.width);
}