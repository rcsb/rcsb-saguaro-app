import {VictoryTooltip} from "victory";
import * as React from "react";
import {VictoryTooltipProps} from "victory-tooltip";
import {ChartTools} from "../../../RcsbChartTools/ChartTools";
import {ChartDataInterface} from "../../../RcsbChartDataProvider/ChartDataProviderInterface";
import {ChartConfigInterface} from "../../ChartConfigInterface";
import {Operator} from "../../../../RcsbUtils/Helpers/Operator";

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
        return Operator.digitGrouping(d.y) + (d.yc > 0? (" of " + Operator.digitGrouping(d.y+d.yc)) : "") + " group members\n" +
            "Click to refine group\n" +
            "Shift-click to search";
    }

}