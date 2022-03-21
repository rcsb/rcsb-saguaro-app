import {VictoryAxis} from "victory";
import * as React from "react";
import {VictoryAxisProps} from "victory-axis";

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
                }
            }}
            tickFormat={
                (t: number)=>{
                    return (!t.toString().includes('.') ? t : "");
                }
            }
        />);
    }

}