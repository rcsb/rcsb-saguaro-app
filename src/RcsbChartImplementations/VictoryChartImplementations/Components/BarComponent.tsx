import * as React from "react";
import {Bar, BarProps} from "victory";
import {BarClickCallbackType} from "../../../RcsbChartComponent/ChartConfigInterface";


export interface BarComponentInterface extends BarProps{
    barClick?:BarClickCallbackType;
    barHover?:BarClickCallbackType;
    barLeave?:BarClickCallbackType;
    x0?:number;
}

export class BarComponent extends React.Component <BarComponentInterface,{fillColor:string;}> {

    private readonly MIN_THR: number = 3

    readonly state:{fillColor:string} = {
        fillColor: this.props.style.fill
    };

    render(): JSX.Element {
        return (<Bar  {...this.props} x={this.x()} events={this.events()} style={{...this.props.style, ...this.style()}}/>);
    }

    shouldComponentUpdate(nextProps: Readonly<BarComponentInterface>, nextState: Readonly<{ fillColor: string }>, nextContext: any): boolean {
        return (
            this.props.x !== nextProps.x ||
            this.props.y !== nextProps.y ||
            this.props.x0 !== nextProps.x0 ||
            this.props.y0 !== nextProps.y0 ||
            this.state.fillColor !== nextState.fillColor
        );
    }

    private style(): React.CSSProperties{
        if(typeof this.props.barClick === "function")
            return {
                cursor: "pointer",
                fill: this.state.fillColor
            }
    }

    x(): number {
        if(this.props.x && this.props.x0 && this.props.datum.y > 0 && (this.props.x-this.props.x0) < this.MIN_THR)
            return this.props.x0+this.MIN_THR
        return this.props.x;
    }

    private events():React.DOMAttributes<unknown> {
        return {
            ...this.props.events,
            onClick:(e)=>{
                if(typeof this.props.barClick === "function")
                    this.props.barClick(this.props.datum, this.props.data, e)
            },
            onMouseEnter:(e)=>{
                if(typeof this.props.barClick === "function")
                    this.setState({fillColor:"#b2d4f1"});
                if(typeof this.props.barHover === "function")
                    this.props.barHover(this.props.datum, this.props.data, e);
            },
            onMouseLeave:(e)=>{
                if(typeof this.props.barClick === "function")
                    this.setState({fillColor:this.props.style.fill});
                if(typeof this.props.barLeave === "function")
                    this.props.barLeave(this.props.datum, this.props.data, e);
            }
        }
    }
}
