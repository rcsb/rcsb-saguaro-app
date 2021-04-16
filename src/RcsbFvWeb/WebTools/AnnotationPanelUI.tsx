import * as React from "react";
import {Constants} from "../Utils/Constants";
import * as classes from "./scss/bootstrap.module.scss";
import {Button} from "react-bootstrap";
import {FilterPanel} from "./FilterPanel";
import {SelectPanel} from "./SelectPanel";
import {AnnotationContext} from "../Utils/AnnotationContext";
import {RcsbFv, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";

export interface UIPanelInterface {
    panelId: string;
    additionalPropertyContext: AnnotationContext;
    filterChangeCallback: ()=>void;
    annotationConfigData: Array<RcsbFvRowConfigInterface>;
    rcsbFv: RcsbFv;
}

interface UIPanelState {
    expandedPanelId: string;

}

export class AnnotationPanelUI extends React.Component<UIPanelInterface, UIPanelState>{

    readonly state = {
        expandedPanelId: "none"
    }

    render():JSX.Element {
        return(
            <div className={classes.filterPanelBootstrapComponentScope} style={{marginTop:15}}>
                <div id={this.props.panelId+Constants.buttonPanelUIDivSuffix}>
                    <div style={{display:"inline-block"}}>
                        <Button onClick={()=>{this.changeState("filterPanel")}}>FILTER</Button>
                    </div>
                    <div style={{display:"inline-block", marginLeft:3}}>
                        <Button onClick={()=>{this.changeState("selectPanel")}}>SELECT</Button>
                    </div>
                </div>
                <div id={this.props.panelId+Constants.containerPanelUIDivSuffix}>
                    <FilterPanel panelId={"filterPanel"} expandedPanelId={this.state.expandedPanelId} additionalPropertyContext={this.props.additionalPropertyContext} filterChangeCallback={this.props.filterChangeCallback}/>
                    <SelectPanel panelId={"selectPanel"} expandedPanelId={this.state.expandedPanelId} additionalPropertyContext={this.props.additionalPropertyContext} rcsbFv={this.props.rcsbFv} />
                </div>
            </div>
        );
    }

    private changeState(panelId: string): void{
        this.setState({expandedPanelId: panelId === this.state.expandedPanelId ? "none" : panelId});
    }

}