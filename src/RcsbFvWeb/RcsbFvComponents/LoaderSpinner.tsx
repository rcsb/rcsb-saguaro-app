import React, {ReactNode} from "react";
import * as classes from "../../scss/load-spinner.scss";

export class LoaderSpinner extends React.Component <{}, {}> {

    render():ReactNode{
        return(<div style={{position:"absolute", left:0, right: 0, marginLeft:"auto", zIndex: Number.MAX_SAFE_INTEGER, marginRight:"auto"}}>
            <div className={classes.loadSpinnerComponentScope}>
                <div className={"loader"}/>
            </div>
        </div>);
    }

}