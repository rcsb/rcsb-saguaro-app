import {rcsbFvCtxManager} from "./RcsbFvContextManager";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {RcsbFv, RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro";
import {
    RcsbFvModuleBuildInterface,
    RcsbFvModuleInterface,
    RcsbFvModulePublicInterface
} from "../RcsbFvModule/RcsbFvModuleInterface";
import {SelectButtonConfigInterface, WebToolsManager} from "../WebTools/WebToolsManager";
import {GroupedOptionsInterface, SelectOptionInterface} from "../WebTools/SelectButton";

export interface CreateFvInterface {
    elementId: string;
    fvModuleI: new (elementId:string, rcsbFv: RcsbFv) => RcsbFvModuleInterface;
    config: RcsbFvModuleBuildInterface;
    p?: PolymerEntityInstanceTranslate;
}

export class RcsbFvCoreBuilder {

    static async getPolymerEntityInstanceMapAndBuildFv(entryId: string, f:(p: PolymerEntityInstanceTranslate)=>Promise<RcsbFvModulePublicInterface>): Promise<RcsbFvModulePublicInterface>{
        const entityToInstance: PolymerEntityInstanceTranslate = await rcsbFvCtxManager.getEntityToInstance(entryId);
        return await f(entityToInstance);
    }

    static createFvBuilder(
        elementId: string,
        fvModuleI: new (elementId:string, rcsbFv: RcsbFv) => RcsbFvModuleInterface,
        config: RcsbFvModuleBuildInterface
    ): ((p: PolymerEntityInstanceTranslate)=>Promise<RcsbFvModulePublicInterface>) {
        return (p: PolymerEntityInstanceTranslate)=>{
            return RcsbFvCoreBuilder.createFv({
                elementId:elementId,
                fvModuleI:fvModuleI,
                config:config,
                p:p
            });
        }
    }

    static async createFv (createFvI: CreateFvInterface): Promise<RcsbFvModulePublicInterface> {
        const elementId: string = createFvI.elementId;
        const fvModuleI: new (elementId:string, rcsbFv: RcsbFv) => RcsbFvModuleInterface = createFvI.fvModuleI;
        const config: RcsbFvModuleBuildInterface = createFvI.config;
        const p: PolymerEntityInstanceTranslate = createFvI.p;
        let rcsbFvInstance: RcsbFvModuleInterface;
        if (rcsbFvCtxManager.getFv(elementId) != null) {
            rcsbFvInstance = new fvModuleI(elementId, rcsbFvCtxManager.getFv(elementId));
            if(p!=null) rcsbFvInstance.setPolymerEntityInstanceTranslator(p);
            await rcsbFvInstance.build(config);
        } else {
            const rcsbFvSingleViewer: RcsbFv = RcsbFvCoreBuilder.buildRcsbFvSingleViewer(elementId);
            rcsbFvInstance = new fvModuleI(elementId, rcsbFvSingleViewer);
            if(p!=null) rcsbFvInstance.setPolymerEntityInstanceTranslator(p);
            await rcsbFvInstance.build(config);
            rcsbFvCtxManager.setFv(elementId, rcsbFvSingleViewer);
        }
        return rcsbFvInstance;
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