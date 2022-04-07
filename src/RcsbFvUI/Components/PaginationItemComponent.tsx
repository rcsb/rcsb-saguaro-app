import React from "react";
import {asyncScheduler, Subscription} from "rxjs";
import {AbstractMenuItemComponent, MenuItemInterface} from "../AbstractMenuItemComponent";
import {ItemComponent} from "./ItemComponent";

export class PaginationItemComponent<T extends unknown[]> extends AbstractMenuItemComponent<T, {count:number;},{after:number;first:number;}> {

    private subscription: Subscription;
    readonly state:{after:number;first:number;} = {
        after: parseInt(this.props.actionMethod.additionalConfig.page.after),
        first: this.props.actionMethod.additionalConfig.page.first > this.props.count ? this.props.count : this.props.actionMethod.additionalConfig.page.first
    }

    render(): JSX.Element {
        return (
            <ItemComponent role={""}>
                <div onClick={()=>this.next(-this.state.first)} role={"button"} className={"d-inline-block text-center"} style={{cursor:"pointer",width:20}}>❮</div>
                <div className={"d-inline-block text-center"} style={{width:80}}>{this.state.after+1} - {this.state.after+this.state.first}</div>
                <div onClick={()=>this.next(this.state.first)} role={"button"} className={"d-inline-block text-center"} style={{width:20}}>❯</div>
            </ItemComponent>
        );
    }

    shouldComponentUpdate(nextProps: Readonly<MenuItemInterface<T> & { count: number }>, nextState: Readonly<{ after: number; first: number }>, nextContext: any): boolean {
        return this.state.after != nextState.after;
    }

    async componentDidUpdate(prevProps: Readonly<MenuItemInterface<T> & { count: number }>, prevState: Readonly<{ after: number; first: number }>, snapshot?: any) {
        await this.execute();
    }

    async execute(): Promise<void> {
        if(this.subscription) this.subscription.unsubscribe()
        this.subscription = asyncScheduler.schedule(async ()=>{
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
        },333);

    }

    private next(n: number): void{
        this.setState({after: (this.state.after + n) >= 0 ? ((this.state.after + n) < this.props.count ? this.state.after + n : (this.props.count-n)) : 0});
    }

}