import {VictoryAxis, VictoryLabel} from "victory";
import * as React from "react";
import {VictoryAxisProps} from "victory-axis";
import {ChartTools} from "../../RcsbChartTools/ChartTools";
import {ChartConfigInterface, ChartViewInterface} from "../ChartViewInterface";

export class AxisFactory {

    public static getDependentAxis(props?: VictoryAxisProps): JSX.Element {
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

    public static getAxis(config: ChartConfigInterface): JSX.Element {
        return (<VictoryAxis
            tickFormat={(t) => {
                if(config.mergeDomainMaxValue){
                    if(parseFloat(t)<=config.mergeDomainMaxValue)
                        return t;
                    else
                        return "";
                }
                return t;
            }}
            label={config.axisLabel}
            labelComponent={<VictoryLabel style={{fontFamily: ChartTools.fontFamily}} />}
            tickLabelComponent={<VictoryLabel style={{fontFamily: ChartTools.fontFamily}} />}
        />);
    }

}