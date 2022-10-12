import React from "react";
import {Button, Collapse} from "react-bootstrap";
import {AbstractMenuItemComponent} from "../AbstractMenuItemComponent";
import {RcsbFvModulePublicInterface} from "../../RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {ItemComponent} from "./ItemComponent";

interface FilterItemProps {
    elements:string[];
    stateChange:(state:FilterPartialState,prevState:FilterPartialState)=>void;
}

interface FilterPartialState {
    filteredElements: string[];
}

interface FilterItemState extends FilterPartialState{
    collapseIn:boolean;
}

export class FilterItemComponent extends AbstractMenuItemComponent<FilterItemProps,FilterPartialState,FilterItemState> {

    private readonly allowedValues:Map<string,boolean> = new Map<string,boolean>();
    readonly state: FilterItemState = {
        filteredElements:[],
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

}