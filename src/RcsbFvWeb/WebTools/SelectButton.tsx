import * as React from "react";
import Select, {components, GroupBase} from 'react-select';
import {SingleValueProps} from "react-select";
import {OptionProps} from "react-select";
import {CSSObjectWithLabel, OptionsOrGroups} from "react-select/dist/declarations/src/types";

export interface GroupedOptionsInterface {
    options: Array<SelectOptionInterface>;
    label: string;
}


interface SelectButtonInterface {
    elementId: string;
    options?: Array<SelectOptionInterface> | Array<GroupedOptionsInterface>;
    additionalOptions?: Array<SelectOptionInterface>;
    addTitle: boolean;
    defaultValue?: string|undefined|null;
    width?:number;
    dropdownTitle?:string;
    optionProps?: (props: OptionProps<OptionPropsInterface,false,GroupOptionPropsInterface>)=>JSX.Element;
    isAdditionalButton?: boolean;
}

export interface SelectOptionInterface {
    optId?: string;
    groupLabel?: string;
    name?: string;
    shortLabel?: string;
    label: string;
    onChange: ()=>void;
}

export interface OptionPropsInterface extends SelectOptionInterface{
    value: number;
}

interface GroupOptionPropsInterface {
    label: string;
    options:OptionPropsInterface[];
}

interface SelectButtonState {
    selectedOption: OptionPropsInterface;
}

export class SelectButton extends React.Component <SelectButtonInterface, SelectButtonState> {

    public static readonly BUTTON_CONTAINER_DIV_SUFFIX = "_buttonContainerDiv";

    private defaultValue: string|undefined|null;
    readonly state: SelectButtonState = {
        selectedOption: ((this.props.options as Array<GroupedOptionsInterface>)[0].options) == null ? {...((this.props.options as Array<SelectOptionInterface>)[0]), value:0} : {...((this.props.options as Array<GroupedOptionsInterface>)[0].options[0]), value: 0}
    };

    constructor(props: SelectButtonInterface) {
        super(props);
        this.defaultValue = props.defaultValue;
    }

    private change(option: OptionPropsInterface): void {
        this.setState({selectedOption: option});
    }

    componentDidUpdate(prevProps: Readonly<SelectButtonInterface>, prevState: Readonly<SelectButtonState>): void {
        this.state.selectedOption.onChange();
    }

    componentDidMount(): void {
        this.defaultValue = null;
    }

    render():JSX.Element {
        const title: JSX.Element = typeof this.props.dropdownTitle === "string" ? <div style={{color:"grey",fontWeight:"bold",fontSize:12}}>{this.props.dropdownTitle}</div> : null;
        return (<div>
            {this.selectRender()}
        </div>);

    }

    private selectRender():JSX.Element {
        const {selectOpt, index}: {selectOpt: SelectOptionInterface; index: number;} = this.getSelectOpt();
        if(this.props.addTitle === true)
            return this.titleRender(selectOpt, index);
        else
            return this.selectButtonRender(selectOpt, index);
    }

    private titleRender(defaultValue: SelectOptionInterface, index: number):JSX.Element{
        return(<div>
            <div style={{display:"inline-block"}}>{this.selectButtonRender(defaultValue, index)}</div><div style={{display:"inline-block", marginLeft:"20px"}}>{defaultValue.name}</div>
        </div>);
    }

    private selectButtonRender(defaultValue: SelectOptionInterface, index: number):JSX.Element {
        return (<div id={this.props.elementId+SelectButton.BUTTON_CONTAINER_DIV_SUFFIX}>
            {this.innerSelectButtonRender(defaultValue, index)}
        </div>);
    }

    private innerSelectButtonRender(defaultValue: SelectOptionInterface, index: number):JSX.Element {
        const SingleValue:(props:SingleValueProps<OptionPropsInterface,false,GroupOptionPropsInterface>)=>JSX.Element = (props:SingleValueProps<OptionPropsInterface,false,GroupOptionPropsInterface>) => {
            const label: string = typeof props.data.shortLabel === "string" ? props.data.shortLabel : props.data.label;
            return (
                <components.SingleValue {...props}>
                    {label}
                </components.SingleValue>
            )
        };
        let options: OptionsOrGroups<OptionPropsInterface,GroupOptionPropsInterface>;
        if((this.props.options as Array<GroupedOptionsInterface>)[0].options == null){
            options = (this.props.options as Array<SelectOptionInterface>).map((opt,index)=>{
                const props: OptionPropsInterface = {...opt,value:index};
                return props;
            });
        }else{
            let i: number = 0;
            options = (this.props.options as Array<GroupedOptionsInterface>).map((group,n)=>({
                label: group.label,
                options: group.options.map(opt=>({
                    ...opt,
                    value:i++
                }))
            }))
        }
        const title: JSX.Element = typeof this.props.dropdownTitle === "string" ? <div style={{color:"grey",fontWeight:"bold",fontSize:12}}>{this.props.dropdownTitle}</div> : null;
        return(
            <div style={{display:"inline-block"}}>
                {title}
                <div >
                    <Select<OptionPropsInterface,false,GroupOptionPropsInterface>
                        options={options}
                        isSearchable={false}
                        onChange={this.change.bind(this)}
                        styles={this.configStyle()}
                        components={{ SingleValue, Option: this.props.optionProps ?? ((props)=>(<components.Option {...props}/>)) }}
                        defaultValue={{...defaultValue,value:index}}
                    />
                </div>
            </div>
        );
    }

    private configStyle() {
        return {
            control: (base: CSSObjectWithLabel) => ({
                ...base,
                width: this.props.width ?? 120,
                border: '1px solid #ddd',
                boxShadow: 'none',
                '&:hover': {
                    border: '1px solid #ddd',
                }

            }),
            menu: (base: CSSObjectWithLabel) => ({
                ...base,
                width:500
            }),
            option: (base: CSSObjectWithLabel)=>({
                ...base
            })
        };
    }

    private getSelectOpt(): {selectOpt: SelectOptionInterface; index: number;}{
        let index: number = 0;
        let selectOpt: SelectOptionInterface;
        if(this.defaultValue!=null){
            if((this.props.options as Array<GroupedOptionsInterface>)[0].options == null) {
                const n: number = (this.props.options as Array<OptionPropsInterface>).findIndex(a => {
                    return a.optId === this.defaultValue
                });
                if (n >= 0) {
                    index = n;
                    selectOpt = (this.props.options as Array<SelectOptionInterface>)[n];
                }
            }else if((this.props.options as Array<GroupedOptionsInterface>)[0].options != null){
                let flag: boolean = false;
                for(const group of (this.props.options as Array<GroupedOptionsInterface>)){
                    for(const opt of group.options){
                        if(opt.optId === this.defaultValue){
                            selectOpt = opt;
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
            selectOpt = this.state.selectedOption;
            index = (this.props.options as Array<OptionPropsInterface>).findIndex(a => {
                return a.optId === this.state.selectedOption.optId
            });
        }
        return {selectOpt: selectOpt, index: index};
    }
}