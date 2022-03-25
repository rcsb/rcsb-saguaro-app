import * as React from "react";
import {VictoryLabel, VictoryLabelProps} from "victory";
import uniqid from 'uniqid';

import {ChartTools} from "../../RcsbChartTools/ChartTools";

interface LabelComponentState {
    text:string;
    collapsed: string;
    label:string;
}

export class LabelComponent extends React.Component<VictoryLabelProps, LabelComponentState>{

    public static readonly THR: number = (ChartTools.paddingLeft + ChartTools.xDomainPadding)*0.75;
    public static readonly OVERFLOW_POSTFIX: " ..." = " ...";
    private static readonly BACKGROUND_COLOR: string = "#FFF";

    readonly state: LabelComponentState = {
        text: this.props.text  as string,
        label: formatLabel(this.props.text as string),
        collapsed: formatLabel(this.props.text as string)
    };

    render():JSX.Element {
        const labelPosition: {textAnchor:"start" | "end";x:number;} = this.state.collapsed !== this.state.text ? {textAnchor:"start", x:0} : {textAnchor:"end",x:this.props.x as number};
        return (<VictoryLabel
            {...this.props}
            {...labelPosition}
            style={{fontSize: 12, fontFamily: ChartTools.fontFamily}}
            text={this.state.label}
            id={()=>("label-component-"+uniqid())}
            backgroundStyle={{fill:LabelComponent.BACKGROUND_COLOR}}
            events={{
                onMouseEnter: this.state.collapsed !== this.state.text ? this.expandText.bind(this) : undefined,
                onMouseLeave: this.state.collapsed !== this.state.text ? this.collapseText.bind(this) : undefined
            }}
        />);
    }

    shouldComponentUpdate(nextProps: Readonly<VictoryLabelProps>, nextState: Readonly<LabelComponentState>, nextContext: any): boolean {
        return (nextProps.text != this.props.text || nextState.label != this.state.label);
    }

    componentDidUpdate(prevProps: Readonly<VictoryLabelProps>, prevState: Readonly<LabelComponentState>, snapshot?: any) {
        if(prevProps.text != this.props.text)
            this.setState({
                text: this.props.text  as string,
                label: formatLabel(this.props.text as string),
                collapsed: formatLabel(this.props.text as string)
            });
    }

    expandText(): void {
        this.setState({label:this.state.text}, );
    }

    collapseText(): void {
        this.setState({label:this.state.collapsed});
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

/*    private mouseOver(): void {
        const rect: SVGRectElement = document.getElementById(this.props.id as string)?.previousSibling as SVGRectElement;
        if (rect) {
            const x: string = rect.getAttribute("x");
            if(x != "0") this.x = x;
            rect.setAttribute("x", "0");
        }
    }

    private mouseLeave(): void {
        const rect: SVGRectElement = document.getElementById(this.props.id as string)?.previousSibling as SVGRectElement;
        if (rect) {
            rect.setAttribute("x", this.x);
        }
    }*/