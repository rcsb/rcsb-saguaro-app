import React, {ReactNode} from "react";

export class SelectButtonTitle  extends React.Component <{title:string}> {

    render(): ReactNode {
        return (<div style={{marginLeft:20}}>{this.props.title}</div>);
    }
}