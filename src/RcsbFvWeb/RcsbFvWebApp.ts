import {RcsbFv} from 'rcsb-saguaro';

import {RcsbFvEntity} from "./RcsbFvModule/RcsbFvEntity";
import {RcsbFvInstance} from "./RcsbFvModule/RcsbFvInstance";
import {RcsbFvUniprot} from "./RcsbFvModule/RcsbFvUniprot";
import {RcsbFvModuleInterface} from "./RcsbFvModule/RcsbFvModuleInterface";
import {WebToolsManager} from "./WebTools/WebToolsManager";
import {RcsbFvUniprotEntity} from "./RcsbFvModule/RcsbFvUniprotEntity";

interface RcsbFvSingleViewerInterface {
    queryId: string;
    elementId: string;
    rcsbFv: RcsbFv;
    rcsbFvModule: RcsbFvModuleInterface;
}

export class RcsbFvWebApp {
    private static rcsbFvManager: Map<string, RcsbFvSingleViewerInterface> = new Map<string, RcsbFvSingleViewerInterface>();

    public static buildUniprotFv(elementId: string, upAcc: string): void {
        if(RcsbFvWebApp.rcsbFvManager.has(elementId)){
            const rcsbFvUniprot: RcsbFvUniprot = new RcsbFvUniprot(elementId, RcsbFvWebApp.rcsbFvManager.get(elementId).rcsbFv);
            rcsbFvUniprot.build(upAcc, true);
            RcsbFvWebApp.rcsbFvManager.get(elementId).rcsbFvModule = rcsbFvUniprot;
        } else {
            const rcsbFvSingleViewer: RcsbFvSingleViewerInterface = {
                rcsbFv: new RcsbFv({
                    rowConfigData: null,
                    boardConfigData: null,
                    elementId: elementId
                }),
                rcsbFvModule: null,
                elementId: elementId,
                queryId: upAcc
            };
            const rcsbFvUniprot: RcsbFvUniprot = new RcsbFvUniprot(elementId, rcsbFvSingleViewer.rcsbFv);
            rcsbFvUniprot.build(upAcc, false);
            rcsbFvSingleViewer.rcsbFvModule = rcsbFvUniprot;
            RcsbFvWebApp.rcsbFvManager.set(elementId, rcsbFvSingleViewer);
        }
    }

    public static buildUniprotEntityFv(elementId: string, upAcc: string, entityId: string): void {
        if(RcsbFvWebApp.rcsbFvManager.has(elementId)){
            const rcsbFvUniprot:RcsbFvUniprotEntity = new RcsbFvUniprotEntity(elementId, RcsbFvWebApp.rcsbFvManager.get(elementId).rcsbFv);
            rcsbFvUniprot.build(upAcc, entityId, true);
            RcsbFvWebApp.rcsbFvManager.get(elementId).rcsbFvModule = rcsbFvUniprot;
        } else {
            const rcsbFvSingleViewer: RcsbFvSingleViewerInterface = {
                rcsbFv: new RcsbFv({
                    rowConfigData: null,
                    boardConfigData: null,
                    elementId: elementId
                }),
                rcsbFvModule:null,
                elementId: elementId,
                queryId: entityId
            };
            const rcsbFvUniprot:RcsbFvUniprotEntity = new RcsbFvUniprotEntity(elementId, rcsbFvSingleViewer.rcsbFv);
            rcsbFvUniprot.build(upAcc, entityId, false);
            rcsbFvSingleViewer.rcsbFvModule = rcsbFvUniprot;
            RcsbFvWebApp.rcsbFvManager.set(elementId, rcsbFvSingleViewer);
        }
    }

    public static buildEntityFv(elementId: string, entityId: string): void {
        if(RcsbFvWebApp.rcsbFvManager.has(elementId)){
            const rcsbFvEntity:RcsbFvEntity = new RcsbFvEntity(elementId, RcsbFvWebApp.rcsbFvManager.get(elementId).rcsbFv);
            rcsbFvEntity.build(entityId, true);
            RcsbFvWebApp.rcsbFvManager.get(elementId).rcsbFvModule = rcsbFvEntity;
        } else {
            const rcsbFvSingleViewer: RcsbFvSingleViewerInterface = {
                rcsbFv: new RcsbFv({
                    rowConfigData: null,
                    boardConfigData: null,
                    elementId: elementId
                }),
                rcsbFvModule:null,
                elementId: elementId,
                queryId: entityId
            };
            const rcsbFvEntity:RcsbFvEntity = new RcsbFvEntity(elementId, rcsbFvSingleViewer.rcsbFv);
            rcsbFvEntity.build(entityId, false);
            rcsbFvSingleViewer.rcsbFvModule = rcsbFvEntity;
            RcsbFvWebApp.rcsbFvManager.set(elementId, rcsbFvSingleViewer);
        }

    }

    public static buildInstanceFv(elementId: string, instanceId: string): void {
        if(RcsbFvWebApp.rcsbFvManager.has(elementId)){
            const rcsbFvInstance:RcsbFvInstance = new RcsbFvInstance(elementId, RcsbFvWebApp.rcsbFvManager.get(elementId).rcsbFv);
            rcsbFvInstance.build(instanceId, true);
            RcsbFvWebApp.rcsbFvManager.get(elementId).rcsbFvModule = rcsbFvInstance;
        } else {
            const rcsbFvSingleViewer: RcsbFvSingleViewerInterface = {
                rcsbFv: new RcsbFv({
                    rowConfigData: null,
                    boardConfigData: null,
                    elementId: elementId
                }),
                rcsbFvModule: null,
                elementId: elementId,
                queryId: instanceId
            };
            const rcsbFvInstance:RcsbFvInstance = new RcsbFvInstance(elementId, rcsbFvSingleViewer.rcsbFv);
            rcsbFvInstance.build(instanceId, false);
            rcsbFvSingleViewer.rcsbFvModule = rcsbFvInstance;
            RcsbFvWebApp.rcsbFvManager.set(elementId, rcsbFvSingleViewer);
        }
    }

    public static buildSelectButton(elementId: string, elementFvId: string){
        if(RcsbFvWebApp.rcsbFvManager.has(elementFvId)){
            RcsbFvWebApp.rcsbFvManager.get(elementFvId).rcsbFvModule.getTargets().then(targets=>{
                WebToolsManager.buildSelectButton(elementId,[RcsbFvWebApp.rcsbFvManager.get(elementFvId).queryId].concat(targets).map(t=>{
                    return {
                        text: t,
                        onChange:()=>{
                            if(t===RcsbFvWebApp.rcsbFvManager.get(elementFvId).queryId){
                                RcsbFvWebApp.buildEntityFv(elementFvId,RcsbFvWebApp.rcsbFvManager.get(elementFvId).queryId);
                            }else{
                                RcsbFvWebApp.buildUniprotEntityFv(elementFvId,t,RcsbFvWebApp.rcsbFvManager.get(elementFvId).queryId);
                            }
                        }
                    }
                }))
            })
        }
    }

}

