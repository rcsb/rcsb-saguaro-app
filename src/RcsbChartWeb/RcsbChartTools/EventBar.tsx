import * as React from "react";
import {Bar, BarProps} from "victory";

export interface BarData {
    x:string|number;
    y:number;
    isLabel:boolean;
}

export type BarClickCallbackType = (datum:BarData,data:BarData[])=>void;
export class EventBar extends React.Component <BarProps & {barClick?:BarClickCallbackType, x0?:number;},{fillColor:string;}> {


    private readonly MIN_THR: number = 3

    readonly state:{fillColor:string} = {
        fillColor: this.props.style.fill
    };


    render(): JSX.Element {
        return (<Bar  {...this.props} x={this.x()} events={this.events()} style={{...this.props.style, ...this.style()}}/>);
    }

    private style(): React.CSSProperties{
        if(typeof this.props.barClick === "function")
            return {
                cursor: "pointer",
                fill: this.state.fillColor
            }
    }

    x(): number {
        if(this.props.x && this.props.x0 && (this.props.x-this.props.x0) > 0 && (this.props.x-this.props.x0) < this.MIN_THR)
            return this.props.x0+this.MIN_THR
        return this.props.x;

    }

    private events():React.DOMAttributes<any> {
        return {
            onClick:()=>{
                if(typeof this.props.barClick === "function")
                    this.props.barClick(this.props.datum, this.props.data)
            },
            onMouseEnter:()=>{
                if(typeof this.props.barClick === "function")
                    this.setState({fillColor:"#b2d4f1"});
            },
            onMouseLeave:()=>{
                if(typeof this.props.barClick === "function")
                    this.setState({fillColor:this.props.style.fill});
            }
        }
    }
}
