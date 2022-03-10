import {VictoryTooltip} from "victory";
import * as React from "react";
import {BarData} from "./EventBarComponent";

export class TooltipComponent extends VictoryTooltip {

    render() {
        return (<VictoryTooltip {...this.props} text={this.text.bind(this)} pointerWidth={5} flyoutPadding={10} activateData={true}/>);
    }

    private text():string {
        const d: BarData = (this.props.datum as BarData);
        return d.y.toString() + (d.yc > 0? (" of " + (d.y+d.yc).toString()) : "") + " group members\n" +
            "Click to refine group\n" +
            "Shift-click to search";
    }

}