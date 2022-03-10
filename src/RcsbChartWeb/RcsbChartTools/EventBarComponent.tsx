import * as React from "react";
import {Bar, BarProps} from "victory";

export interface BarData {
    x:string|number;
    y:number;
    yc?:number;
    label?:string;
    isLabel:boolean;
}

export interface EventBarComponentInterface extends BarProps{
    barClick?:BarClickCallbackType;
    barHover?:BarClickCallbackType;
    barLeave?:BarClickCallbackType;
    x0?:number;
}

export type BarClickCallbackType = (datum:BarData,data:BarData[],e:React.MouseEvent<any>)=>void;
export class EventBarComponent extends React.Component <EventBarComponentInterface,{fillColor:string;}> {


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
