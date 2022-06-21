import {VictoryTooltip} from "victory";
import * as React from "react";
import {VictoryTooltipProps} from "victory-tooltip";
import {ChartTools} from "../../../RcsbChartTools/ChartTools";
import {ChartDataInterface} from "../../../RcsbChartDataProvider/ChartDataProviderInterface";
import {ChartConfigInterface} from "../../ChartConfigInterface";

type TooltipPropsType = VictoryTooltipProps & {tooltipText?:ChartConfigInterface["tooltipText"]};
export class TooltipFactory extends React.Component<TooltipPropsType, any> {

    public static getTooltip(props:TooltipPropsType) {
        return (<VictoryTooltip
            {...props}
            text={TooltipFactory.text}
            pointerWidth={5}
            flyoutPadding={10}
            activateData={true}
            style={{
                fontFamily: ChartTools.getConfig<string>("fontFamily", {}),
            }}
        />);
    }

    private static text(props:TooltipPropsType):string {
        const d: ChartDataInterface = (props.datum as ChartDataInterface);
        if(typeof props.tooltipText === "function")
            return props.tooltipText(d);
        return d.y.toString() + (d.yc > 0? (" of " + (d.y+d.yc).toString()) : "") + " group members\n" +
            "Click to refine group\n" +
            "Shift-click to search";
    }

}