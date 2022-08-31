import * as React from "react";

export class SelectButtonTitle  extends React.Component <{title:string}> {

    render(): JSX.Element {
        return (<div style={{marginLeft:20}}>{this.props.title}</div>);
    }
}