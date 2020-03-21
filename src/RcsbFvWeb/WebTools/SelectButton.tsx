import * as React from "react";
import {CSSProperties} from "react";
import Select, {Styles} from 'react-select';

export interface SelectOptionInterface {
    label: string;
    onChange: ()=>void;
}

interface SelectButtonInterface {
    options: Array<SelectOptionInterface>;
}

interface SelectButtonState {
    value: number;
}

interface OptionInterface {
    value:number;
    label:string;
}

export class SelectButton extends React.Component <SelectButtonInterface, SelectButtonState> {

    readonly state: SelectButtonState = {
        value: 0
    };

    change(option: OptionInterface):void {
        this.setState({value: option.value});
    }

    componentDidUpdate(prevProps: Readonly<SelectButtonInterface>, prevState: Readonly<SelectButtonState>): void {
        this.props.options[this.state.value].onChange();
    }

    render() {
        return (
            <Select
                options={
                    this.props.options.map((opt, index) => {
                        return {value:index, label:opt.label};
                    })
                }
                isSearchable={false}
                onChange={this.change.bind(this)}
                defaultValue={{value:0, label:this.props.options[0].label}}
                styles={SelectButton.configStyle()}
            />
        );
    }

    private static configStyle(): Styles{
        return {
            control: (base: CSSProperties, state) => ({
                ...base,
                width:120,
                border: '1px solid #ddd',
                boxShadow: 'none',
                '&:hover': {
                    border: '1px solid #ddd',
                }

            })
        };
    }
}