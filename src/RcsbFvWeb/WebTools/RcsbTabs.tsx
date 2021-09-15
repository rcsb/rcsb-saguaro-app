import * as React from "react";
import {Tab, Tabs} from "react-bootstrap";
import * as classes from "./scss/group-display.module.scss";

export interface RcsbTabsInterface<T extends string> {
    tabList: Array<{key:T, title:string}>;
    default: T;
    id: string;
    onSelect(t: T): void;
    onMount(t: T): void;
}

export class RcsbTabs<T extends string> extends React.Component <RcsbTabsInterface<T>, {}> {

    constructor(props:RcsbTabsInterface<T>) {
        super(props);
    }

    render(): JSX.Element {
        return (<div className={classes.bootstrapGroupSequenceComponentScope}>
            <Tabs
                id={this.props.id}
                defaultActiveKey={this.props.default}
                onSelect={(eventKey: string)=>{
                    this.props.onSelect(eventKey as T);
                }}
            >
                {
                    this.props.tabList.map(tab=>(
                        <Tab eventKey={tab.key} title={tab.title}>
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