import * as React from "react";
import {CSSProperties} from "react";
import Select, {Styles, components, ValueType, OptionsType, GroupedOptionsType} from 'react-select';
import {SingleValueProps} from "react-select/src/components/SingleValue";
import {OptionProps} from "react-select/src/components/Option";

export interface GroupedOptionsInterface {
    options: Array<SelectOptionInterface>;
    label: string;
}

export interface SelectOptionInterface {
    optId?: string;
    label: string;
    groupLabel?: string;
    name?: string;
    shortLabel?: string;
    onChange: ()=>void;
}

interface SelectButtonInterface {
    options?: Array<SelectOptionInterface> | Array<GroupedOptionsInterface>;
    additionalOptions?: Array<SelectOptionInterface>;
    addTitle: boolean;
    defaultValue?: string|undefined|null;
    width?:number;
    dropdownTitle?:string;
    optionProps?: (props: OptionProps<OptionPropsInterface>)=>JSX.Element;
    titleStyle?: CSSProperties;
}

export interface OptionPropsInterface extends SelectOptionInterface{
    value: number;
}

interface SelectButtonState {
    selectedOption: OptionPropsInterface;
}

export class SelectButton extends React.Component <SelectButtonInterface, SelectButtonState> {

    readonly state: SelectButtonState = {
        selectedOption: ((this.props.options as Array<GroupedOptionsInterface>)[0].options) == null ? {...((this.props.options as Array<SelectOptionInterface>)[0]), value:0} : {...((this.props.options as Array<GroupedOptionsInterface>)[0].options[0]), value: 0}
    };

    private change(option: OptionPropsInterface):void {
        this.setState({selectedOption: option});
    }

    componentDidUpdate(prevProps: Readonly<SelectButtonInterface>, prevState: Readonly<SelectButtonState>): void {
        this.state.selectedOption.onChange();
    }

    render():JSX.Element {
        const title: JSX.Element = typeof this.props.dropdownTitle === "string" ? <div style={{color:"grey",fontWeight:"bold",fontSize:12, ...this.props.titleStyle}}>{this.props.dropdownTitle}</div> : null;
        return(<div>
            {title}
            {this.selectRender()}
        </div>);
    }

    private selectRender():JSX.Element {
        if(this.props.addTitle === true)
            return this.titleRender();
        else
            return this.selectButtonRender();
    }

    private titleRender():JSX.Element{
        return(<div>
            <div style={{display:"inline-block"}}>{this.selectButtonRender()}</div><div style={{display:"inline-block", marginLeft:"20px"}}>{this.state.selectedOption.name}</div>
        </div>);
    }

    private selectButtonRender():JSX.Element {
        const SingleValue:(n:SingleValueProps<OptionPropsInterface>)=>JSX.Element = (props:SingleValueProps<OptionPropsInterface>) => {
            const label: string = typeof props.data.shortLabel === "string" ? props.data.shortLabel : props.data.label;
            return (
                <components.SingleValue {...props}>
                    {label}
                </components.SingleValue>
            )
        };
        const Option = (props:OptionProps<OptionPropsInterface>)=>{
            return (components.Option && <div style={{display:'flex'}}><input type={'checkbox'}/><components.Option {...props}/></div>);
        };
        let index: number = 0;
        let defaultValue: SelectOptionInterface;
        if(this.props.defaultValue!=null){
            if((this.props.options as Array<GroupedOptionsInterface>)[0].options == null) {
                const n: number = (this.props.options as Array<OptionPropsInterface>).findIndex(a => {
                    return a.optId === this.props.defaultValue
                });
                if (n >= 0) {
                    index = n;
                    defaultValue = (this.props.options as Array<SelectOptionInterface>)[n];
                }
            }else if((this.props.options as Array<GroupedOptionsInterface>)[0].options != null){
                let flag: boolean = false;
                for(const group of (this.props.options as Array<GroupedOptionsInterface>)){
                    for(const opt of group.options){
                        if(opt.optId === this.props.defaultValue){
                            defaultValue = opt;
                            flag = true;
                            break;
                        }
                        index++;
                    }
                    if (flag){
                        break;
                    }
                }
            }
        }else{
            if((this.props.options as Array<GroupedOptionsInterface>)[0].options == null) {
                defaultValue = (this.props.options as Array<SelectOptionInterface>)[0];
            }else if((this.props.options as Array<GroupedOptionsInterface>)[0].options != null){
                defaultValue = (this.props.options as Array<GroupedOptionsInterface>)[0].options[0];
            }
        }
        let options: OptionsType<OptionPropsInterface> | GroupedOptionsType<OptionPropsInterface>;
        if((this.props.options as Array<GroupedOptionsInterface>)[0].options == null){
            options = (this.props.options as Array<SelectOptionInterface>).map((opt,index)=>{
                const props: OptionPropsInterface = {...opt,value:index};
                return props;
            });
        }else{
            let i: number = 0;
            options = (this.props.options as Array<GroupedOptionsInterface>).map(group=>({
                label: group.label,
                options: group.options.map(opt=>({
                    ...opt,
                    value:i++
                }))
            }))
        }
        return(
            <Select
                options={options}
                isSearchable={false}
                onChange={this.change.bind(this)}
                styles={this.configStyle()}
                components={{ SingleValue, Option: this.props.optionProps ?? ((props)=>(<components.Option {...props}/>)) }}
                defaultValue={{...defaultValue,value:index}}
            />
        );
    }

    private configStyle(): Styles{
        return {
            control: (base: CSSProperties) => ({
                ...base,
                width: this.props.width ?? 120,
                border: '1px solid #ddd',
                boxShadow: 'none',
                '&:hover': {
                    border: '1px solid #ddd',
                }

            }),
            menu: (base: CSSProperties) => ({
                ...base,
                width:500
            }),
            option: (base:CSSProperties)=>({
                ...base
            })
        };
    }
}