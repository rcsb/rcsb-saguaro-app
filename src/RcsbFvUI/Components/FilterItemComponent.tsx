import React from "react";
import {Button, Collapse} from "react-bootstrap";
import {AbstractMenuItemComponent} from "../AbstractMenuItemComponent";
import {RcsbFvModulePublicInterface} from "../../RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {ItemComponent} from "./ItemComponent";

interface FilterItemState {
    collapseIn:boolean;
}

export class FilterItemComponent<T extends unknown[]> extends AbstractMenuItemComponent<T,{pfv:RcsbFvModulePublicInterface;},{collapseIn:boolean;}> {

    private readonly allowedValues:Map<string,boolean> = new Map<string,boolean>();
    readonly state: FilterItemState ={
        collapseIn:false,
    }

    render():JSX.Element {
        return (<>
            <ItemComponent onClick={()=>this.setState({collapseIn:!this.state.collapseIn})} >FILTER</ItemComponent>
            <Collapse in={this.state.collapseIn}>
                <div className={"position-absolute"} ></div>
            </Collapse>
        </>);
    }

    async componentDidMount() {
        (await this.props.pfv.getAlignmentResponse()).target_alignment_subset.edges.map(e=>e.node).forEach(n=>console.log(n))
    }

    execute(): void {
    }

}