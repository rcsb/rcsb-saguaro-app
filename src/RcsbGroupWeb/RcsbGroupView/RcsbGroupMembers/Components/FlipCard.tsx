import * as React from "react";
import classes from "./scss/flip-card.module.scss";

interface FlipCardState {
    flip:boolean;
    classes:string[];
}

export class FlipCard extends React.Component<{},FlipCardState> {

    readonly state:FlipCardState = {flip:true, classes:[classes.flipCardInner]};
    render():JSX.Element {
        return (
            <div>
                <div style={{display:"flex", flexDirection:"row"}}>
                    <div style={{flexGrow:1}} onClick={()=>{ this.flip(true) }}>Inner</div>
                    <div style={{flexGrow:1}} onClick={()=>{ this.flip(false) }}>Outer</div>
                </div>
                <div className={classes.flipCard}>
                    <div className={this.state.classes.join(" ")}>
                        {
                            this.props.children
                        }
                    </div>
                </div>
            </div>
        );
    }

    flip(flag:boolean): void {
        if(this.state.flip != flag){
            this.setState({flip:flag});
            if(flag)
                this.setState({classes:[classes.flipCardInner]})
            else
                this.setState({classes:[classes.flipCardInner, classes.flipCardInnerRotate]})
        }
    }


}

export class FlipCardFront extends React.Component<{},null> {
    render(): JSX.Element {
        return (<div className={classes.flipCardFront}>
            {this.props.children}
        </div>);
    }
}

export class FlipCardBack extends React.Component<{},null> {
    render(): JSX.Element {
        return (<div className={classes.flipCardBack}>
            {this.props.children}
        </div>);
    }
}