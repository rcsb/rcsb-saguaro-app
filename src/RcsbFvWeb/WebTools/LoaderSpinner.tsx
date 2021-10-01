import * as React from "react";
import * as classes from "./scss/load-spinner.scss";

export class LoaderSpinner extends React.Component <{}, {}> {

    render(): JSX.Element{
        return(<div className={classes.loadSpinnerComponentScope}>
            <div className={"loader"}/>
        </div>);
    }

}