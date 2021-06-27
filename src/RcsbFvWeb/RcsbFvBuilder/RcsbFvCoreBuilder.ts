import {rcsbFvCtxManager} from "./RcsbFvContextManager";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/PolymerEntityInstanceTranslate";
import {RcsbFv} from "@rcsb/rcsb-saguaro";
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
/**
 * This class provides static methods to build PFVs. PFVs should be always created using methods in this class
 * */
export class RcsbFvCoreBuilder {

    /**
     * @description The main purpose of this method is to have a unique point where Entity to Instance maps are collected.  It forces to generate a <PolymerEntityInstanceTranslate> that will be passed to the PFV create method <getPolymerEntityInstanceMapAndBuildFv>
     * @param entryId PDB entry Id
     * @param createFvBuilder This is the function used to create the PFV. Cases where buttons are needed will be created in custom definitions of createFvBuilder. The PFV should be always created calling RcsbFvCoreBuilder.createFv
     * */
    static async getPolymerEntityInstanceMapAndCustomBuildFv(entryId: string, createFvBuilder:(p: PolymerEntityInstanceTranslate)=>Promise<RcsbFvModulePublicInterface>): Promise<RcsbFvModulePublicInterface>{
        const entityToInstance: PolymerEntityInstanceTranslate = await rcsbFvCtxManager.getEntityToInstance(entryId);
        return await createFvBuilder(entityToInstance);
    }

    /**
     * @description Generic method to create PFVs. This method must be used if no other elements such as buttons are needed.
     * */
    static async getPolymerEntityInstanceMapAndBuildFv(
        elementId: string,
        entryId: string,
        fvModuleI: new (elementId:string, rcsbFv: RcsbFv) => RcsbFvModuleInterface,
        config: RcsbFvModuleBuildInterface
    ): Promise<RcsbFvModulePublicInterface> {
        const entityToInstance: PolymerEntityInstanceTranslate = await rcsbFvCtxManager.getEntityToInstance(entryId);
        return await RcsbFvCoreBuilder.createFv({
            elementId:elementId,
            fvModuleI:fvModuleI,
            config:config,
            p:entityToInstance
        });
    }

    /**
     * @description This method implements a centralized point where PFVs are created. All PFV should be created using this method directly or through <CreateFvInterface.getPolymerEntityInstanceMapAndBuildFv>. In any case PFV should be built using a custom implementation.
     * */
    static async createFv (createFvI: CreateFvInterface): Promise<RcsbFvModulePublicInterface> {
        const elementId: string = createFvI.elementId;
        const fvModuleI: new (elementId:string, rcsbFv: RcsbFv) => RcsbFvModuleInterface = createFvI.fvModuleI;
        const config: RcsbFvModuleBuildInterface = createFvI.config;
        const p: PolymerEntityInstanceTranslate = createFvI.p;
        const rcsbFvInstance: RcsbFvModuleInterface= new fvModuleI(elementId, rcsbFvCtxManager.getFv(elementId));
        if(p!=null) rcsbFvInstance.setPolymerEntityInstanceTranslator(p);
        if(createFvI.config.additionalConfig?.boardConfig)
            rcsbFvInstance.updateBoardConfig(createFvI.config.additionalConfig.boardConfig);
        await rcsbFvInstance.build(config);
        if(!rcsbFvInstance.activeDisplay())
            throw "ERROR: Module display failed";
        config.resolve(rcsbFvInstance);
        return rcsbFvInstance;
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