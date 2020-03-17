import * as React from "react";

export interface SelectOptionInterface {
    text: string;
    onChange: ()=>void;
}

interface SelectButtonInterface {
    options: Array<SelectOptionInterface>;
}

interface SelectButtonState {
    options: Array<SelectOptionInterface>;
    value: number;
}

export class SelectButton extends React.Component <SelectButtonInterface, SelectButtonState> {

    private mounted: boolean = false;

    readonly state: SelectButtonState = {
        options: this.props.options,
        value: 0
    };

    change(event: any):void {
        this.setState({value: event.target.value});
    }

    componentDidUpdate(prevProps: Readonly<SelectButtonInterface>, prevState: Readonly<SelectButtonState>): void {
        this.state.options[this.state.value].onChange();
    }

    render() {
        return (
            <label>
                <select value={this.state.value} onChange={this.change.bind(this)}>
                    {
                        this.state.options.map((opt, index) => {
                            return <option value={index}>{opt.text}</option>
                        })
                    }
                </select>
            </label>
        );
    }
}