import {rcsbFvCtxManager} from "./RcsbFvContextManager";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {EntryInstancesCollector} from "../CollectTools/EntryInstancesCollector";
import {RcsbFv, RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro";
import {RcsbFvModuleBuildInterface, RcsbFvModuleInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {SelectButtonConfigInterface, WebToolsManager} from "../WebTools/WebToolsManager";
import {GroupedOptionsInterface, SelectOptionInterface} from "../WebTools/SelectButton";

export interface CreateFvInterface {
    elementId: string;
    fvModuleI: new (elementId:string, rcsbFv: RcsbFv) => RcsbFvModuleInterface;
    config: RcsbFvModuleBuildInterface;
    p?: PolymerEntityInstanceTranslate;
}

export class RcsbFvCoreBuilder {

    static getPolymerEntityInstanceMapAndBuildFv(entryId: string, f:(p: PolymerEntityInstanceTranslate)=>void, resolve?:()=>Promise<void>): Promise<void>{
        if(rcsbFvCtxManager.getEntityToInstance(entryId) != null) {
            f(rcsbFvCtxManager.getEntityToInstance(entryId));
            if(resolve!=undefined){
                return resolve()
            }
        }else{
            const instanceCollector: EntryInstancesCollector = new EntryInstancesCollector();
            instanceCollector.collect({entry_id:entryId}).then(result=> {
                rcsbFvCtxManager.setEntityToInstance(entryId,new PolymerEntityInstanceTranslate(result));
                f(rcsbFvCtxManager.getEntityToInstance(entryId));
                if(resolve!=undefined){
                    return resolve()
                }
            });
        }
    }

    static createFvBuilder(
        elementId: string,
        fvModuleI: new (elementId:string, rcsbFv: RcsbFv) => RcsbFvModuleInterface,
        config: RcsbFvModuleBuildInterface
    ): ((p: PolymerEntityInstanceTranslate)=>void) {
        return (p: PolymerEntityInstanceTranslate)=>{
            RcsbFvCoreBuilder.createFv({
                elementId:elementId,
                fvModuleI:fvModuleI,
                config:config,
                p:p
            });
        }
    }

    static createFv (createFvI: CreateFvInterface): void {
        const elementId: string = createFvI.elementId;
        const fvModuleI: new (elementId:string, rcsbFv: RcsbFv) => RcsbFvModuleInterface = createFvI.fvModuleI;
        const config: RcsbFvModuleBuildInterface = createFvI.config;
        const p: PolymerEntityInstanceTranslate = createFvI.p;
        if (rcsbFvCtxManager.getFv(elementId) != null) {
            const rcsbFvInstance: RcsbFvModuleInterface = new fvModuleI(elementId, rcsbFvCtxManager.getFv(elementId));
            if(p!=null) rcsbFvInstance.setPolymerEntityInstance(p);
            rcsbFvInstance.build(config);
        } else {
            const rcsbFvSingleViewer: RcsbFv = RcsbFvCoreBuilder.buildRcsbFvSingleViewer(elementId);
            const rcsbFvInstance: RcsbFvModuleInterface = new fvModuleI(elementId, rcsbFvSingleViewer);
            if(p!=null) rcsbFvInstance.setPolymerEntityInstance(p);
            rcsbFvInstance.build(config);
            rcsbFvCtxManager.setFv(elementId, rcsbFvSingleViewer);
        }
    }

    static buildRcsbFvSingleViewer(elementId: string): RcsbFv{
        const config: RcsbFvBoardConfigInterface = rcsbFvCtxManager.getBoardConfig() != null ? {
            rowTitleWidth: 190,
            trackWidth: 900,
            ...rcsbFvCtxManager.getBoardConfig()
        } : {
            rowTitleWidth: 190,
            trackWidth: 900
        };
        return new RcsbFv({
                rowConfigData: null,
                boardConfigData: config,
                elementId: elementId
            });
    }

    static unmount(elementId:string): void{
        if (rcsbFvCtxManager.getFv(elementId) != null) {
            if(rcsbFvCtxManager.getButtonList(elementId)!=null){
                rcsbFvCtxManager.getButtonList(elementId).forEach(buttonId=>{
                    WebToolsManager.clearSelectButton(buttonId);
                });
            }
            rcsbFvCtxManager.getFv(elementId).unmount();
            rcsbFvCtxManager.removeFv(elementId);
        }
    }

    static buildSelectButton(elementFvId: string, selectButtonId: string, options: Array<SelectOptionInterface>|Array<GroupedOptionsInterface>, config?:SelectButtonConfigInterface){
        rcsbFvCtxManager.setButton(elementFvId, selectButtonId);
        WebToolsManager.buildSelectButton(selectButtonId, options, config);
    }

    static clearAdditionalSelectButton(elementFvId: string, selectButtonId: string){
        if(rcsbFvCtxManager.getButtonList(elementFvId)?.has(selectButtonId)){
            rcsbFvCtxManager.getButtonList(elementFvId).delete(selectButtonId);
        }
        WebToolsManager.clearAdditionalSelectButton(selectButtonId);
    }

    static addSelectButton(elementFvId: string, selectButtonId: string, options: Array<SelectOptionInterface>, config?:SelectButtonConfigInterface){
        rcsbFvCtxManager.setButton(elementFvId, selectButtonId);
        WebToolsManager.addSelectButton(selectButtonId, options);
    }

    static showMessage(elementId: string, message: string){
        const domElement: HTMLElement = document.createElement<"h4">("h4");
        domElement.innerHTML = message;
        document.getElementById(elementId).append(domElement);
    }

}