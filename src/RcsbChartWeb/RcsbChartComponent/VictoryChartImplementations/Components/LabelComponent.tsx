import * as React from "react";
import {VictoryLabel, VictoryLabelProps} from "victory";
import uniqid from 'uniqid';
import {ChartTools} from "../../../RcsbChartTools/ChartTools";
import {Subject, Subscription} from "rxjs";

interface LabelComponentState {
    text:string;
    collapsed: string;
    label:string;
    textAnchor?:"start" | "end";
    x?:number;
}

const expandObserver: Subject<{id:string}> = new Subject<{id:string}>();
export class LabelComponent extends React.Component<VictoryLabelProps, LabelComponentState>{

    public static readonly HARD_THR: number = (ChartTools.paddingLeft + ChartTools.xDomainPadding)*0.725;
    public static readonly SOFT_THR: number = (ChartTools.paddingLeft + ChartTools.xDomainPadding)*0.77;
    public static readonly OVERFLOW_POSTFIX: " ..." = " ...";
    private static readonly BACKGROUND_COLOR: string = "#FFF";
    private subscription: Subscription;
    private readonly id: string = "label-component-"+uniqid();

    readonly state: LabelComponentState = formatLabel(this.props.text as string);

    render():JSX.Element {
        return (<VictoryLabel
            {...this.props}
            textAnchor={this.state.textAnchor ?? this.props.textAnchor}
            x={this.state.x ?? this.props.x}
            style={{fontSize: ChartTools.fontSize, fontFamily: ChartTools.fontFamily}}
            text={this.state.label}
            id={this.id}
            backgroundStyle={{fill:LabelComponent.BACKGROUND_COLOR}}
            events={{
                onMouseEnter: this.state.collapsed !== this.state.text ? this.expandText.bind(this) : undefined,
                onMouseLeave: this.state.collapsed !== this.state.text ? this.collapseText.bind(this) : undefined
            }}
        />);
    }

    componentDidMount() {
        this.subscription = expandObserver.subscribe((label)=>{
            if(label.id!==this.id)
                this.collapseText();
        })
    }

    shouldComponentUpdate(nextProps: Readonly<VictoryLabelProps>, nextState: Readonly<LabelComponentState>, nextContext: any): boolean {
        return (
            nextProps.text !== this.props.text ||
            nextState.label !== this.state.label ||
            (nextProps.text === this.props.text && nextProps.y != this.props.y)
        );
    }

    componentDidUpdate(prevProps: Readonly<VictoryLabelProps>, prevState: Readonly<LabelComponentState>, snapshot?: any) {
        if(prevProps.text != this.props.text)
            this.setState({
                x: this.props.x,
                textAnchor: this.props.textAnchor as "start"|"end",
                ...formatLabel(this.props.text as string)
            });
    }

    componentWillUnmount() {
        this.subscription.unsubscribe();
    }

    private expandText(): void {
        expandObserver.next({id:this.id})
        this.setState({label:this.state.text});
    }

    private collapseText(): void {
        this.setState({label:this.state.collapsed});
    }

}


function formatLabel(text: string): LabelComponentState {
    let label: string = text;
    if(displayTextWidth(label) <= LabelComponent.HARD_THR){
        return {text:text, label:label, collapsed:label};
    }else if(displayTextWidth(label) > LabelComponent.HARD_THR && displayTextWidth(label) <= LabelComponent.SOFT_THR){
        return {text:text, label:label, collapsed:label, textAnchor:"start", x:0};
    }else {
        while (displayTextWidth(label,  LabelComponent.OVERFLOW_POSTFIX) > LabelComponent.HARD_THR) {
            label = label.substring(0, label.length - 1);
        }
        return {text:text, label:label+LabelComponent.OVERFLOW_POSTFIX, collapsed:label+LabelComponent.OVERFLOW_POSTFIX, x:0, textAnchor:"start"};
    }

}

function displayTextWidth(text: string, suffix?: string): number {
    const canvas: HTMLCanvasElement = document.createElement<"canvas">("canvas");
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    let metrics = context.measureText(suffix ? text+suffix : text);
    return Math.ceil(metrics.width);
}