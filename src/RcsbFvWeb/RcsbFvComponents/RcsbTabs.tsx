import React, {ReactNode} from "react";
import {Tab, Tabs} from "react-bootstrap";
import * as classes from "../../scss/bootstrap-fv-display.module.scss";
import uniqid from "uniqid";

export interface RcsbTabsInterface<T extends string> {
    tabList: Array<{key:T; title:string; additionalComponent?:ReactNode;}>;
    default: T;

    id: string;
    onSelect(t: T): void;
    onMount(t: T): void;
}

export class RcsbTabs<T extends string> extends React.Component <RcsbTabsInterface<T>, {}> {

    public static readonly UI_SUFFIX: string = "_"+uniqid()+"_UI_DIV";
    public static readonly SELECT_SUFFIX: string = "_"+uniqid()+"_SELECT_DIV";
    constructor(props:RcsbTabsInterface<T>) {
        super(props);
    }

    render():ReactNode {
        return (<div className={classes.bootstrapFvComponentScope}>
            <Tabs
                id={this.props.id}
                defaultActiveKey={this.props.default}
                onSelect={(eventKey: string | null)=>{
                    this.props.onSelect(eventKey as T);
                }}
            >
                {
                    this.props.tabList.map((tab,n)=>(
                        <Tab key={uniqid(`${tab.key}_`)} eventKey={tab.key} title={tab.title}>
                            {
                               tab.additionalComponent
                            }
                            <div id={tab.key+RcsbTabs.UI_SUFFIX} style={{height:20}}/>
                            <div id={tab.key}/>
                        </Tab>
                    ))
                }
            </Tabs>
        </div>);
    }

    componentDidMount() {
        this.props.onMount( this.props.default );
    }

}