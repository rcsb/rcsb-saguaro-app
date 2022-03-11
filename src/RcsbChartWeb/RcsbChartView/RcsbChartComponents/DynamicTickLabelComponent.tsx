import {VictoryLabel, VictoryLabelProps} from "victory";
import * as React from "react";
import {ChartTools} from "../../RcsbChartTools/ChartTools";

const WHITE: "#FFF" = "#FFF";
const SUFFIX: " ..." = " ...";

export class DynamicTickLabelComponent extends React.Component <VictoryLabelProps,{text:string;}> {

    private displayText: string = this.props.text as string;
    private x: number = this.props.x;
    private textAnchor: "begin"|"end" = "end";
    private readonly originalText:string = this.props.text as string;
    private readonly THR: number = (ChartTools.paddingLeft + ChartTools.xDomainPadding)*0.75;
    private readonly hoverFill: (typeof WHITE) = WHITE;
    private readonly overflowSuffix: (typeof SUFFIX) = SUFFIX;
    private readonly id: string = this.props.id + "_" + Math.random().toString(36).substring(2);

    constructor(props: VictoryLabelProps) {
        super(props);
        this.formatLabel();
        this.state = {
            text: this.displayText
        };
    }

    render(): JSX.Element {
        return (<VictoryLabel {...this.props}
                              id={this.id}
                              text={this.state.text}
                              x={this.x}
                              backgroundStyle={{fill:this.hoverFill}}
                              events={this.events()}
                              style={{textAnchor:this.textAnchor,fontSize:12,fontFamily:"\"Helvetica Neue\",Helvetica,Arial,sans-serif"}}
        />);
    }

    componentDidMount(): void {
        this.fixBackgroundX();
        this.fixBackgroundY();
    }

    componentDidUpdate(prevProps: Readonly<VictoryLabelProps>, prevState: Readonly<{ text: string }>, snapshot?: any): void {
        this.fixBackgroundX();
    }

    private fixBackgroundX(): void{
        if (this.textAnchor === "begin") {
            const rect: SVGRectElement = document.getElementById(this.id as string)?.previousSibling as SVGRectElement;
            if (rect) {
                rect.setAttribute("x", "0");
            }
        }
    }

    private fixBackgroundY(): void{
        if (this.textAnchor === "begin") {
            const rect: SVGRectElement = document.getElementById(this.id as string)?.previousSibling as SVGRectElement;
            if(rect) {
                if (rect.height) {
                    rect.setAttribute("height", rect.height.baseVal.value + 3 as unknown as string);
                }
                if (rect.y) {
                    rect.setAttribute("y", rect.y.baseVal.value - 1 as unknown as string);
                }
            }
        }
    }

    private events(): React.DOMAttributes<any>{
        return {
            onMouseEnter:()=>{
                if(this.originalText!==this.displayText){
                    this.setState({text:this.originalText});
                }
            },
            onMouseLeave:()=>{
                if(this.originalText!==this.displayText)
                    this.setState({text:this.displayText});
            }
        }
    }

    private formatLabel(): void {
        let text: string = this.props.text as string;
        const style: React.CSSProperties = this.props.style as React.CSSProperties;
        if(displayTextWidth(text,style.fontFamily, style.fontSize as number) > this.THR) {
            while (displayTextWidth(text, style.fontFamily, style.fontSize as number, this.overflowSuffix) > this.THR) {
                text = text.substring(0, text.length - 1);
            }
        }
        if(text !== this.originalText) {
            text = text + this.overflowSuffix;
            this.x = 0;
            this.textAnchor = "begin";
        }
        this.displayText = text;
    }
}

function displayTextWidth(text: string, font:string, fontSize: number, suffix?: string): number {
    const canvas: HTMLCanvasElement = document.createElement<"canvas">("canvas");
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    let metrics = context.measureText(suffix ? text+suffix : text);
    return Math.ceil(metrics.width);
}