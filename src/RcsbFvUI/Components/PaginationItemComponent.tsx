import {AbstractMenuItemComponent} from "../AbstractMenuItemComponent";

export interface PaginationItemState {
    after:number;
    first:number;
}

export interface PaginationItemProps {
    count:number;
    after:number;
    first:number;
    stateChange(state:PaginationItemState,prevState:PaginationItemState):void;
}

export class PaginationItemComponent extends AbstractMenuItemComponent<PaginationItemProps,PaginationItemState>{

    readonly state:PaginationItemState = {
        after: this.props.after,
        first: this.props.first > this.props.count ? this.props.count : this.props.first
    }

    render(): JSX.Element {
        return (
            <>
                <div
                    onClick={()=>this.next(-this.state.first)}
                    role={this.role(-this.state.first)}
                    className={"d-inline-block text-center"+" "+this.textColor(-this.state.first)}
                    style={{width:20}}
                >❮</div>
                <div
                    className={"d-inline-block text-center"}
                    style={{width:90}}
                >{this.state.after+1} - {this.state.after+this.state.first}</div>
                <div
                    onClick={()=>this.next(this.state.first)}
                    role={this.role(this.state.first)}
                    className={"d-inline-block text-center"+" "+this.textColor(this.state.first)}
                    style={{width:20}}
                >❯</div>
            </>
        );
    }

    componentDidUpdate(prevProps: Readonly<PaginationItemProps & { stateChange(newState: PaginationItemState, oldState: PaginationItemState): void }>, prevState: Readonly<PaginationItemState>, snapshot?: any) {
        super.componentDidUpdate(prevProps, prevState, snapshot);
    }

    private next(n: number): void {
        this.switchAction<undefined>({
            middle:()=>{
                this.setState({after: (this.state.after + n)});
                return undefined;
            },
            end:()=>{
                this.setState({after:this.props.count-n});
                return undefined;
            },
            start:()=>{
                this.setState({after:0});
                return undefined;
            },
            out:()=>{
                return undefined;
            },
        },n);
    }

    private role(n: number): "button"|undefined {
        return this.switchAction<"button"|undefined>({
            middle:()=>{
                return "button";
            },
            end:()=>{
                return "button";
            },
            start:()=>{
                return "button";
            },
            out:()=>{
                return undefined;
            },
        },n);
    }

    private textColor(n: number): "text-white"|"text-opacity-25 text-primary" {
        return this.switchAction<"text-white"|"text-opacity-25 text-primary">({
            middle:()=>{
                return "text-white";
            },
            end:()=>{
                return "text-white";
            },
            start:()=>{
                return "text-white";
            },
            out:()=>{
                return "text-opacity-25 text-primary";
            },
        },n);
    }

    private switchAction<T>(x:{middle:()=>T;end:()=>T;start:()=>T;out:()=>T}, n:number): T {
        const O: number = n > 0 ? this.state.after+n : this.state.after;
        if((O + n) >= 0 && (O + n) <= this.props.count){
            return x.middle();
        }else if((O + n) >= 0 && O != this.props.count){
            return x.end();
        }else if(O != 0 && n<0){
            return x.start();
        }
        return x.out();
    }

}