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
            <input type={"checkbox"} checked={this.state.checked} onChange={this.change.bind(this)} />
        );
    }

    private change():void {
        const previousFlag: boolean = this.props.additionalPropertyFilter.getPropertyValue(this.props.propertyName, this.props.propertyValue);
        this.props.additionalPropertyFilter.setPropertyValue(this.props.propertyName, this.props.propertyValue, !previousFlag);
        this.setState({checked: !previousFlag});
    }
}