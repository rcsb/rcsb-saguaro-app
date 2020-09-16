import * as React from "react";
import {CSSProperties} from "react";
import Select, {Styles, components, OptionProps, ValueType} from 'react-select';
import {SingleValueProps} from "react-select/src/components/SingleValue";
import {assertEnumType} from "graphql";

export interface SelectOptionInterface {
    label: string;
    name?: string;
    shortLabel?: string;
    onChange: ()=>void;
}

interface SelectButtonInterface {
    options: Array<SelectOptionInterface>;
    additionalOptions?: Array<SelectOptionInterface>;
    addTitle: boolean;
    defaultValue?: string|undefined|null;
}

interface OptionPropsInterface extends SelectOptionInterface{
    value: number;
}

interface SelectButtonState {
    selectedOption: OptionPropsInterface;
}

export class SelectButton extends React.Component <SelectButtonInterface, SelectButtonState> {

    readonly state: SelectButtonState = {
        selectedOption: {...(this.props.options[0]), value:0}
    };

    private change(option: OptionPropsInterface):void {
        this.setState({selectedOption: option});
    }

    componentDidUpdate(prevProps: Readonly<SelectButtonInterface>, prevState: Readonly<SelectButtonState>): void {
        this.state.selectedOption.onChange();
    }

    render():JSX.Element {
        if(this.props.addTitle === true)
            return this.titleRender();
        else
            return this.selectRender();
    }

    private titleRender():JSX.Element{
        return(<div>
            <div style={{display:"inline-block"}}>{this.selectRender()}</div><div style={{display:"inline-block", marginLeft:"20px"}}>{this.state.selectedOption.name}</div>
        </div>);
    }

    private selectRender():JSX.Element {
        const SingleValue:(n:SingleValueProps<OptionPropsInterface>)=>JSX.Element = (props:SingleValueProps<OptionPropsInterface>) => {
            const label: string = typeof props.data.shortLabel === "string" ? props.data.shortLabel : props.data.label;
            return (
                <components.SingleValue {...props}>
                    {label}
                </components.SingleValue>
            )};
        let index: number = 0;
        if(this.props.defaultValue!=null){
            const n: number = this.props.options.findIndex(a=>{return a.shortLabel === this.props.defaultValue});
            if(n>=0) index=n;
        }
        return(
            <Select
                options={
                    this.props.options.map((opt,index)=>{
                        const props: OptionPropsInterface = {...opt,value:index};
                        return props;
                    })
                }
                isSearchable={false}
                onChange={this.change.bind(this)}
                styles={SelectButton.configStyle()}
                components={{ SingleValue }}
                defaultValue={{...(this.props.options[index]),value:index}}
            />
        );
    }

    private static configStyle(): Styles{
        return {
            control: (base: CSSProperties, state:SelectButtonState) => ({
                ...base,
                width:120,
                border: '1px solid #ddd',
                boxShadow: 'none',
                '&:hover': {
                    border: '1px solid #ddd',
                }

            }),
            menu: (base: CSSProperties, state:SelectButtonState) => ({
                ...base,
                width:500
            })
        };
    }
}