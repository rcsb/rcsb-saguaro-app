import React from "react";
import {Collapse} from "react-bootstrap";
import {AbstractMenuItemComponent} from "../AbstractMenuItemComponent";
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