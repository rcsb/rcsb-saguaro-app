import {VictoryLabel, VictoryLabelProps} from "victory";
import * as React from "react";
import {ChartTools} from "./ChartTools";

const WHITE: "#FFF" = "#FFF";
const SUFFIX: " ..." = " ...";

export class DynamicTickLabelComponent extends React.Component <VictoryLabelProps,{text:string;x:number;}> {

    private readonly originalText:string = this.props.text as string;
    private displayText: string = this.props.text as string;
    private originalX: number = this.props.x;
    private direction: string = this.props.direction;
    private readonly THR: number = ChartTools.paddingLeft;
    private hoverFill: (typeof WHITE) = WHITE;
    private overflowSuffix: (typeof SUFFIX) = SUFFIX;

    constructor(props: VictoryLabelProps) {
        super(props);
        this.formatLabel();
        this.state = {
            text: this.displayText,
            x: this.originalX
        };
    }

    render(): JSX.Element {
        return (<VictoryLabel {...this.props}  text={this.state.text} x={this.state.x} backgroundStyle={{fill:this.hoverFill}} direction={this.direction} events={this.events()} style={{fontSize:10}}/>);
    }

    componentDidMount() {
    }

    private events(): React.DOMAttributes<any>{
        return {
            onMouseEnter:()=>{
                if(this.originalText!==this.displayText){
                    const textWidth:number = displayTextWidth(this.originalText as string,(this.props.style as React.CSSProperties).fontFamily) - ChartTools.xDomainPadding;
                    this.setState({text:this.originalText,x:textWidth});
                }
            },
            onMouseLeave:()=>{
                if(this.originalText!==this.displayText)
                    this.setState({text:this.displayText,x:this.originalX});
            }
        }
    }

    private formatLabel(): void {
        let text: string = this.props.text as string;
        while(displayTextWidth(text,(this.props.style as React.CSSProperties).fontFamily, this.overflowSuffix) > this.THR){
            text = text.substring(0, text.length - 1);
        }

        if(text !== this.originalText)
            text = text + this.overflowSuffix;

        this.displayText = text;
    }
}

function displayTextWidth(text: string, font:string, suffix?: string) {
    /*const canvas: HTMLCanvasElement = document.createElement<"canvas">("canvas");
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    context.font = font;
    let metrics = context.measureText(suffix ? text+suffix : text);
    return Math.ceil(metrics.width);*/

    const svg: SVGSVGElement = document.createElement("svg");
    svg.append('g')
        .selectAll('.dummyText')     // declare a new CSS class 'dummyText'
        .data(textData)
        .enter()                     // create new element
        .append("text")              // add element to class
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        //.attr("opacity", 0.0)      // not really necessary
        .text(function(d) { return d})
        .each(function(d,i) {
            var thisWidth = this.getComputedTextLength()
            textWidth.push(thisWidth)
            this.remove() // remove them just after displaying them
        })
}