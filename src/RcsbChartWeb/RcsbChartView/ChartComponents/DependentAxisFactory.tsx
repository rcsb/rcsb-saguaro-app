import {VictoryAxis, VictoryLabel} from "victory";
import * as React from "react";
import {VictoryAxisProps} from "victory-axis";
import {ChartTools} from "../../RcsbChartTools/ChartTools";
import {LabelTextComponent} from "./LabelTextComponent";

export class DependentAxisFactory {

    public static getAxis(props?: VictoryAxisProps): JSX.Element {
        return (<VictoryAxis
            {...props}
            dependentAxis={true}
            crossAxis={true}
            style={{
                grid: {
                    stroke: "#999999",
                    strokeDasharray: "1 3"
                },
            }}
            tickFormat={
                (t: number)=>{
                    return (!t.toString().includes('.') ? t : "");
                }
            }
            tickLabelComponent={<VictoryLabel style={{fontFamily: ChartTools.fontFamily}} />}
        />);
    }

}