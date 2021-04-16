import * as React from "react";
import {RcsbFv, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {Button, Collapse} from "react-bootstrap";
import {AnnotationContext} from "../Utils/AnnotationContext";
import {SelectRow} from "./SelectRow";

interface SelectPanelInterface{
    additionalPropertyContext: AnnotationContext;
    panelId: string;
    expandedPanelId: string;
    rcsbFv: RcsbFv;
}


export class SelectPanel extends React.Component<SelectPanelInterface,{annotationConfigData: Array<RcsbFvRowConfigInterface>}> {

    readonly state = {
        annotationConfigData: this.props.additionalPropertyContext.getAnnotationConfigData()
    }

    componentDidUpdate(prevProps: Readonly<SelectPanelInterface>, prevState: Readonly<{ annotationConfigData: Array<RcsbFvRowConfigInterface> }>, snapshot?: any) {
        if(prevProps.expandedPanelId != this.props.panelId && this.props.expandedPanelId == this.props.panelId)
            this.setState({annotationConfigData: this.props.additionalPropertyContext.getAnnotationConfigData()});
    }

    render():JSX.Element {
        return (
            <Collapse in={this.props.panelId === this.props.expandedPanelId}>
                <div style={{zIndex:10, marginTop:5, position: "absolute", left:0, width:"100%", borderTop:"1px solid #DDD", borderBottom:"1px solid #DDD", backgroundColor: "#FFF"}}>
                    <div style={{paddingTop:10, paddingLeft:15, paddingBottom:10,fontSize:12}}>
                        <SelectRow annotationConfigData={this.state.annotationConfigData} rcsbFv={this.props.rcsbFv} />
                    </div>
                </div>
            </Collapse>
        );
    }

}