import {VictoryTooltip} from "victory";
import * as React from "react";
import {BarData} from "./BarComponent";
import {VictoryTooltipProps} from "victory-tooltip";
import {ChartTools} from "../../RcsbChartTools/ChartTools";

export class TooltipFactory extends React.Component<VictoryTooltipProps, any> {

    public static getTooltip(props:VictoryTooltipProps) {
        return (<VictoryTooltip
            {...props}
            text={TooltipFactory.text}
            pointerWidth={5}
            flyoutPadding={10}
            activateData={true}
            style={{
                fontFamily: ChartTools.fontFamily,
            }}
        />);
    }

    private static text(props:VictoryTooltipProps):string {
        const d: BarData = (props.datum as BarData);
        return d.y.toString() + (d.yc > 0? (" of " + (d.y+d.yc).toString()) : "") + " group members\n" +
            "Click to refine group\n" +
            "Shift-click to search";
    }

}