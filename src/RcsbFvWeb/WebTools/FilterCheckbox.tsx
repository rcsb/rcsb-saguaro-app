import * as React from "react";
import {PropertyName} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {AnnotationContext} from "../Utils/AnnotationContext";

export interface FilterCheckboxInterface {
    propertyName: PropertyName;
    propertyValue: any;
    additionalPropertyFilter: AnnotationContext;
}

export interface FilterCheckboxState {
    checked: boolean;
}

export class FilterCheckbox extends React.Component<FilterCheckboxInterface,FilterCheckboxState> {

    constructor(props: FilterCheckboxInterface) {
        super(props);
        this.state = {
            checked: this.props.additionalPropertyFilter.getPropertyValue(this.props.propertyName, this.props.propertyValue)
        }
    }

    render():JSX.Element {
        return (
            <div style={{cursor:"pointer"}} onMouseEnter={(evt)=>{this.enter(evt)}} onMouseDown={this.down.bind(this)}>
                <div style={{display:"inline-block", marginRight:10}} >
                    <input type={"checkbox"} checked={this.state.checked} readOnly  />
                </div>
                <div style={{display:"inline-block", fontSize:12, color: this.state.checked ? "black" : "grey"}}>
                    {this.props.propertyValue}
                </div>
            </div>
        );
    }

    componentDidUpdate(prevProps: Readonly<FilterCheckboxInterface>, prevState: Readonly<FilterCheckboxState>, snapshot?: any) {
        this.props.additionalPropertyFilter.setPropertyValue(this.props.propertyName, this.props.propertyValue, this.state.checked);
    }

    private enter(evt: React.MouseEvent<HTMLDivElement>): void {
        if(evt.buttons == 1)
            this.down();
    }

    private down():void {
        const previousFlag: boolean = this.props.additionalPropertyFilter.getPropertyValue(this.props.propertyName, this.props.propertyValue);
        this.setState({checked: !previousFlag});
    }


}