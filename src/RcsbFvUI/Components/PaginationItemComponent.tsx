import React from "react";
import {asyncScheduler, Subscription} from "rxjs";
import {SelectionInterface} from "@rcsb/rcsb-saguaro/build/RcsbBoard/RcsbSelection";
import {AbstractMenuItemComponent, MenuItemInterface} from "../AbstractMenuItemComponent";
import {ItemComponent} from "./ItemComponent";
import {RcsbFvModulePublicInterface} from "../../RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";

export class PaginationItemComponent<T extends unknown[]> extends AbstractMenuItemComponent<T, {count:number;pfv:RcsbFvModulePublicInterface;},{after:number;first:number;}> {

    private subscription: Subscription;
    readonly state:{after:number;first:number;} = {
        after: parseInt(this.props.actionMethod.additionalConfig.page.after),
        first: this.props.actionMethod.additionalConfig.page.first > this.props.count ? this.props.count : this.props.actionMethod.additionalConfig.page.first
    }

    render(): JSX.Element {
        if(this.props.actionMethod.additionalConfig.page.first < this.props.count)
            return (
                <ItemComponent role={""}>
                    <div
                        onClick={()=>this.next(-this.state.first)}
                        role={this.role(-this.state.first)}
                        className={"d-inline-block text-center"+" "+this.textColor(-this.state.first)}
                        style={{width:20}}
                    >❮</div>
                    <div
                        className={"d-inline-block text-center"}
                        style={{width:80}}
                    >{this.state.after+1} - {this.state.after+this.state.first}</div>
                    <div
                        onClick={()=>this.next(this.state.first)}
                        role={this.role(this.state.first)}
                        className={"d-inline-block text-center"+" "+this.textColor(this.state.first)}
                        style={{width:20}}
                    >❯</div>
                </ItemComponent>
            );
        return null;
    }

    async componentDidUpdate(prevProps: Readonly<MenuItemInterface<T> & { count: number }>, prevState: Readonly<{ after: number; first: number }>, snapshot?: any) {
        await this.execute();
    }

    async execute(): Promise<void> {
        if(this.subscription) this.subscription.unsubscribe()
        this.subscription = asyncScheduler.schedule(async ()=>{
            const dom:[number,number] = this.props.pfv.getFv().getDomain()
            const sel: SelectionInterface[] = this.props.pfv.getFv().getSelection("select")
            await this.props.actionMethod.pfvMethod(
                this.props.elementId,
                ...this.props.actionMethod.pfvParams,
                {
                    ...this.props.actionMethod.additionalConfig,
                    page:{
                        after: this.state.after.toString(),
                        first: this.state.first
                    }
                }
            );
            this.props.pfv.getFv().setDomain(dom);
            this.props.pfv.getFv().setSelection({
                elements:sel.map((s)=>({
                    begin:s.rcsbFvTrackDataElement.begin,
                    end:s.rcsbFvTrackDataElement.end
                })),
                mode:"select"
            });
        },333);

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