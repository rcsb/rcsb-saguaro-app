import * as React from "react";
import {RcsbFv, RcsbFvDisplayTypes, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {Button} from "react-bootstrap";
import {SelectAction} from "./SelectAction";

interface SelectRowInterface{
    annotationConfigData: Array<RcsbFvRowConfigInterface>;
    rcsbFv: RcsbFv;
}

export class SelectRow extends React.Component<SelectRowInterface, null>{
    render():JSX.Element {
        return (
            <>
                {
                    this.props.annotationConfigData.map(rowConfig => {
                        const selectAction: JSX.Element | string  = rowConfig.displayType == RcsbFvDisplayTypes.AREA ? (<div>{'x > 0'} </div>) : "ALL";
                        return (
                            <div key={rowConfig.trackId + "_selectAction"} style={{marginBottom:3}}>
                                <SelectAction rowConfig={rowConfig} rcsbFv={this.props.rcsbFv}/>
                            </div>
                        );
                    })
                }
            </>
        );
    }


}