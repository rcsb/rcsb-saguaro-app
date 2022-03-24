import * as React from "react";
import {ChartTools} from "../../RcsbChartTools/ChartTools";

interface LabelTextInterface extends React.SVGProps<SVGTextElement>  {
    text:string;
    collapsed: string;
}

export class LabelTextComponent extends React.Component<LabelTextInterface, {}>{

    private x: string = "";
    render():JSX.Element {
        return (<text {...this.props} >
            {
                (this.props.children as React.Component[]).map(child=>(
                    <TextContainerComponent
                        {...child.props}
                        text={this.props.text}
                        collapsed={this.props.collapsed}
                        onMouseOver={ this.props.text != this.props.collapsed ? this.mouseOver.bind(this) : undefined}
                        onMouseOut={ this.props.text != this.props.collapsed ? this.mouseLeave.bind(this) : undefined}
                    />
                ))
            }
        </text>);
    }

    private mouseOver(): void {
        const rect: SVGRectElement = document.getElementById(this.props.id as string)?.previousSibling as SVGRectElement;
        if (rect) {
            const x: string = rect.getAttribute("x");
            if(x != "0") this.x = x;
            rect.setAttribute("x", "0");
        }
    }

    private mouseLeave(): void {
        const rect: SVGRectElement = document.getElementById(this.props.id as string)?.previousSibling as SVGRectElement;
        if (rect) {
            rect.setAttribute("x", this.x);
        }
    }

}

interface TextContainerState {
    text:string;
    collapsed: string;
    label:string;
}

interface TextContainerInterface extends React.SVGProps<SVGTSpanElement> {
    text:string;
    collapsed: string;
}

class TextContainerComponent extends React.PureComponent<TextContainerInterface,TextContainerState> {

    readonly state: TextContainerState = {
        ...this.props,
        label: this.props.collapsed
    };

    render(): JSX.Element {
        const labelPosition: {textAnchor:"begin" | "end";x:number;} = this.state.collapsed !== this.state.text ? {textAnchor:"begin", x:0} : {textAnchor:"end",x:this.props.x as number};
        return (<tspan
            {...this.props}
            {...labelPosition}
            style={{fontSize: 12, fontFamily: ChartTools.fontFamily}}
            onMouseEnter={ this.state.collapsed !== this.state.text ? this.expandText.bind(this) : undefined }
            onMouseLeave={ this.state.collapsed !== this.state.text ? this.collapseText.bind(this) : undefined }
        >
            {this.state.label}
        </tspan>);
    }

    shouldComponentUpdate(nextProps: Readonly<TextContainerInterface>, nextState: Readonly<TextContainerState>, nextContext: any): boolean {
        return (nextProps.text != this.props.text || nextState.label != this.state.label);
    }

    componentDidUpdate(prevProps: Readonly<TextContainerInterface>, prevState: Readonly<TextContainerState>, snapshot?: any) {
        if(prevProps.text != this.props.text)
            this.setState({...this.props, label:this.props.collapsed});
    }

    expandText(): void {
        this.setState({label:this.state.text}, );
    }

    collapseText(): void {
        this.setState({label:this.state.collapsed});
    }

}