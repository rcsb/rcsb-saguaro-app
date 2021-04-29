import * as React from "react";
import {ChangeEvent, MouseEvent} from "react";
import {
    RcsbFv,
    RcsbFvDisplayTypes,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import {Button} from "react-bootstrap";
import {SetSelectionInterface} from "@rcsb/rcsb-saguaro/build/RcsbFv/RcsbFvContextManager/RcsbFvContextManager";

interface SelectActionInterface{
    rowConfig: RcsbFvRowConfigInterface;
    rcsbFv: RcsbFv;
}

interface SelectActionState {
    value: number;
    buttonText: string;
}

export class SelectAction extends React.Component<SelectActionInterface, SelectActionState>{
    readonly state = {
        value: 0,
        buttonText: "SELECT"
    }

    private changeValue(evt: ChangeEvent<HTMLInputElement>): void{
        if(Number.isInteger(parseFloat(evt.target.value)))
            this.setState({value: parseInt(evt.target.value)});
        else
            this.setState({value: 0});
    }

    private selectAnnotations(evt: MouseEvent<HTMLElement>): void{
        const action: (selection: SetSelectionInterface)=>void = evt.shiftKey ?  this.props.rcsbFv.addSelection.bind(this.props.rcsbFv) : this.props.rcsbFv.setSelection.bind(this.props.rcsbFv);
        if(this.props.rowConfig.displayType == RcsbFvDisplayTypes.AREA){
            action({
                elements: this.props.rowConfig.trackData.filter(d=>{return d.value>=this.state.value}).map(d=>{
                    return {begin: d.begin, end: d.end}
                }),
                mode:'select'
            })
        }else {
            if(this.props.rowConfig.trackData){
                action({
                    elements: this.props.rowConfig.trackData.map(d => {
                        return {begin: d.begin, end: d.end}
                    }),
                    mode: 'select'
                });
            }else if(this.props.rowConfig.displayConfig){
                let data: Array<RcsbFvTrackDataElementInterface> = new Array<RcsbFvTrackDataElementInterface>();
                this.props.rowConfig.displayConfig.forEach((display)=>{
                    data = data.concat(
                        display.displayData.map(d => {
                            return {begin: d.begin, end: d.end}
                        })
                    )
                })
                action({
                    elements: data,
                    mode: 'select'
                });
            }
        }
    }

    private buttonHover(evt: MouseEvent<HTMLElement>){
        if(evt.shiftKey)
            this.setState({buttonText:"ADD"});
        else
            this.setState({buttonText:"SELECT"});
    }

    render():JSX.Element {
        const selectAction: JSX.Element  = this.props.rowConfig.displayType == RcsbFvDisplayTypes.AREA ?
            (<div>{'> '}<input style={{width:40,height:20}} type={"text"} value={this.state.value} onChange={(evt)=>{this.changeValue(evt)}}/></div>) :
            (<div style={{color:"grey"}}>CURRENT</div>);
        return (
            <>
                <div style={{display:"inline-block"}}>
                    <Button onClick={(evt)=>{this.selectAnnotations(evt)}} style={{backgroundColor:"#999", border:0}}>{this.state.buttonText}</Button>
                </div>
                <div style={{display:"inline-block", marginLeft:15, width:70}}>{selectAction}</div>
                <div style={{display:"inline-block"}}>{this.props.rowConfig.rowTitle}</div>
            </>
        );
    }

}
