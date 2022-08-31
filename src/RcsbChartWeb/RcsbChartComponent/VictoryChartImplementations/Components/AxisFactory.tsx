import {VictoryAxis, VictoryLabel} from "victory";
import * as React from "react";
import {VictoryAxisProps} from "victory-axis";
import {ChartTools} from "../../../RcsbChartTools/ChartTools";
import {ChartConfigInterface} from "../../ChartConfigInterface";
import {Operator} from "../../../../RcsbUtils/Helpers/Operator";

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
                    return (!t.toString().includes('.') ? Operator.digitGrouping(t) : "");
                }
            }
            axisLabelComponent={<VictoryLabel style={{fontFamily: ChartTools.getConfig<string>("fontFamily", {}), fontSize:ChartTools.getConfig<string>("fontSize",{})}} />}
            tickLabelComponent={<VictoryLabel style={{fontFamily: ChartTools.getConfig<string>("fontFamily", {}), fontSize:ChartTools.getConfig<number>("fontSize",{})}} />}
        />);
    }

    public static getRegularAxis(config: ChartConfigInterface): JSX.Element {
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
            axisLabelComponent={<VictoryLabel style={{fontFamily: ChartTools.getConfig<string>("fontFamily", {}), fontSize:ChartTools.getConfig<string>("fontSize", {})}} />}
            tickLabelComponent={<VictoryLabel style={{fontFamily: ChartTools.getConfig<string>("fontFamily", {}), fontSize:ChartTools.getConfig<string>("fontSize", {})}} />}
        />);
    }

}