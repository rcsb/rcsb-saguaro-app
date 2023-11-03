import {asyncScheduler, Subscription} from "rxjs";
import {SelectionInterface} from "@rcsb/rcsb-saguaro/lib/RcsbBoard/RcsbSelection";
import {
    RcsbFvAdditionalConfig,
    RcsbFvModulePublicInterface
} from "../../RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";

export namespace ActionMethods {

    type PfvMethodType<T  extends unknown[]> = (...pfvParams: MenuActionArgsType<T>)=>Promise<RcsbFvModulePublicInterface>;
    type MenuActionArgsType<T extends unknown[]> = [string, ...T, RcsbFvAdditionalConfig?];

    export interface FvChangeConfigInterface {
        beforeChangeCallback?:(module:RcsbFvModulePublicInterface|undefined)=>void;
        onChangeCallback?:(module:RcsbFvModulePublicInterface)=>void;
    }

    export function paginationCallback<T extends unknown[]>(): (elementId:string, pfv: RcsbFvModulePublicInterface, pfvMethod: PfvMethodType<T>, pfvParams: T, additionalConfig?:RcsbFvAdditionalConfig & FvChangeConfigInterface)=>void {
        let subscription: Subscription | undefined = undefined;
        return (elementId:string, pfv: RcsbFvModulePublicInterface, pfvMethod: PfvMethodType<T>, pfvParams: T, additionalConfig?:RcsbFvAdditionalConfig & FvChangeConfigInterface)=>{
            if(subscription) subscription.unsubscribe()
            subscription = asyncScheduler.schedule(async ()=>{
                const dom:[number,number] = pfv.getFv().getDomain();
                const sel: SelectionInterface[] = pfv.getFv().getSelection("select");
                additionalConfig?.beforeChangeCallback?.(pfv);
                await pfvMethod(
                    elementId,
                    ...pfvParams,
                    {
                        ...additionalConfig,
                    }
                );
                pfv.getFv().setDomain(dom);
                pfv.getFv().setSelection({
                    elements:sel.map((s)=>({
                        begin:s.rcsbFvTrackDataElement.begin,
                        end:s.rcsbFvTrackDataElement.end
                    })),
                    mode:"select"
                });
                additionalConfig?.onChangeCallback?.(pfv);
            },333);
       }
    }

}