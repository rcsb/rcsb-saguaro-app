import * as React from "react";

import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tabs';

import {PropertyName} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {AnnotationContext} from "../Utils/AnnotationContext";
import {FilterCheckbox} from "./FilterCheckbox";
import {Collapse} from "react-bootstrap";

export interface FilterPanelInterface {
    additionalPropertyContext: AnnotationContext;
    filterChangeCallback: ()=>void;
    panelId: string;
    expandedPanelId: string;
}

export class FilterPanel extends React.Component<FilterPanelInterface,null> {

    componentDidUpdate(prevProps: Readonly<FilterPanelInterface>, prevState: Readonly<null>, snapshot?: any) {
        if(this.props.panelId === this.props.expandedPanelId)
            this.props.additionalPropertyContext.resetSate();
        else if(this.props.panelId === prevProps.expandedPanelId)
            this.props.filterChangeCallback();
    }

    render():JSX.Element {
        const tabs: JSX.Element = (<Tabs defaultActiveKey={[...this.props.additionalPropertyContext.getPropertyFiler().entries()][0][0]} >
            {
                [...this.props.additionalPropertyContext.getPropertyFiler().entries()].map((entry, index)=>{
                    const [name, values]: [PropertyName, Map<any,boolean>] = entry;
                    return (
                        <Tab key={name} eventKey={name} title={name.replace("_", " ")} >
                            <div style={{paddingTop:10, paddingLeft:15, paddingBottom:10, WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none"}} >
                                {
                                    [...values.entries()].sort((a,b)=>(a[0].localeCompare(b[0]))).map(v=>{
                                        return (
                                            <div key={name+":"+v[0]}>
                                                <div style={{display:"inline-block", marginRight:10}}>
                                                    <FilterCheckbox propertyName={name} propertyValue={v[0]} additionalPropertyFilter={this.props.additionalPropertyContext} />
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </Tab>
                    )
                })
            }
        </Tabs>);
        return (
            <Collapse in={this.props.panelId === this.props.expandedPanelId}>
                <div style={{zIndex:10, marginTop:5, position: "absolute", left:0, width:"100%", borderBottom:"1px solid #DDD", backgroundColor: "#FFF"}}>
                    {tabs}
                </div>
            </Collapse>
        );
    }

}