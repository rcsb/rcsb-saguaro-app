import * as React from "react";
import classes from "../../scss/load-spinner.scss";

export class LoaderSpinner extends React.Component <{}, {}> {

    render(): JSX.Element{
        return(<div style={{position:"absolute", left:0, right: 0, marginLeft:"auto", zIndex: Number.MAX_SAFE_INTEGER, marginRight:"auto"}}>
            <div className={classes.loadSpinnerComponentScope}>
                <div className={"loader"}/>
            </div>
        </div>);
    }

}