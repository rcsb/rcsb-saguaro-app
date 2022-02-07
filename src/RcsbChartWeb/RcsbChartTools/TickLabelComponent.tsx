import {VictoryLabel, VictoryLabelProps} from "victory";
import * as React from "react";

export class TickLabelComponent extends React.Component <VictoryLabelProps,null> {

    constructor(props: VictoryLabelProps) {
        super(props);
    }

    render(): JSX.Element {
        return (<VictoryLabel {...this.props} text={this.labelText()}/>);
    }

    componentDidMount() {
    }

    private labelText(): string {
        return this.props.text as string;
    }
}