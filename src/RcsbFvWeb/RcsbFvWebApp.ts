import {RcsbFv} from 'rcsb-saguaro';

import {RcsbFvEntity} from "./RcsbFvModule/RcsbFvEntity";
import {RcsbFvInstance} from "./RcsbFvModule/RcsbFvInstance";
import {RcsbFvUniprot} from "./RcsbFvModule/RcsbFvUniprot";
import {WebToolsManager} from "./WebTools/WebToolsManager";
import {RcsbFvUniprotEntity} from "./RcsbFvModule/RcsbFvUniprotEntity";
import {EntitySequenceCollector, PolymerEntityInstanceInterface} from "./CollectTools/EntryInstancesCollector";
import {PolymerEntityInstance} from "./Utils/PolymerEntityInstance";
import {TagDelimiter} from "./Utils/TagDelimiter";

interface RcsbFvSingleViewerInterface {
    queryId: string;
    elementId: string;
    rcsbFv: RcsbFv;
}

export class RcsbFvWebApp {
    private static rcsbFvManager: Map<string, RcsbFvSingleViewerInterface> = new Map<string, RcsbFvSingleViewerInterface>();
    private static polymerEntityInstanceMap: Map<string,PolymerEntityInstance> = new Map<string, PolymerEntityInstance>();

    public static buildUniprotFv(elementId: string, upAcc: string): void {
        if(RcsbFvWebApp.rcsbFvManager.has(elementId)){
            const rcsbFvUniprot: RcsbFvUniprot = new RcsbFvUniprot(elementId, RcsbFvWebApp.rcsbFvManager.get(elementId).rcsbFv);
            rcsbFvUniprot.build(upAcc, true);
        } else {
            const rcsbFvSingleViewer: RcsbFvSingleViewerInterface = {
                rcsbFv: new RcsbFv({
                    rowConfigData: null,
                    boardConfigData: null,
                    elementId: elementId
                }),
                elementId: elementId,
                queryId: upAcc
            };
            const rcsbFvUniprot: RcsbFvUniprot = new RcsbFvUniprot(elementId, rcsbFvSingleViewer.rcsbFv);
            rcsbFvUniprot.build(upAcc, false);
            RcsbFvWebApp.rcsbFvManager.set(elementId, rcsbFvSingleViewer);
        }
    }

    public static buildUniprotEntityFv(elementId: string, upAcc: string, entityId: string): void {
        if(RcsbFvWebApp.rcsbFvManager.has(elementId)){
            const rcsbFvUniprot:RcsbFvUniprotEntity = new RcsbFvUniprotEntity(elementId, RcsbFvWebApp.rcsbFvManager.get(elementId).rcsbFv);
            rcsbFvUniprot.build(upAcc, entityId, true);
        } else {
            const rcsbFvSingleViewer: RcsbFvSingleViewerInterface = {
                rcsbFv: new RcsbFv({
                    rowConfigData: null,
                    boardConfigData: null,
                    elementId: elementId
                }),
                elementId: elementId,
                queryId: entityId
            };
            const rcsbFvUniprot:RcsbFvUniprotEntity = new RcsbFvUniprotEntity(elementId, rcsbFvSingleViewer.rcsbFv);
            rcsbFvUniprot.build(upAcc, entityId, false);
            RcsbFvWebApp.rcsbFvManager.set(elementId, rcsbFvSingleViewer);
        }
    }

    public static buildEntitySummaryFv(elementFvId: string, elementSelectId:string, entityId:string): void {
        const rcsbFvSingleViewer: RcsbFvSingleViewerInterface = {
            rcsbFv: new RcsbFv({
                rowConfigData: null,
                boardConfigData: null,
                elementId: elementFvId
            }),
            elementId: elementFvId,
            queryId: entityId
        };
        const buildSelectAndFv: (p: PolymerEntityInstance)=>void = (p: PolymerEntityInstance)=>{
            const rcsbFvEntity: RcsbFvEntity = new RcsbFvEntity(elementFvId, rcsbFvSingleViewer.rcsbFv);
            rcsbFvEntity.setPolymerEntityInstance(p);
            rcsbFvEntity.build(entityId, false);
            RcsbFvWebApp.rcsbFvManager.set(elementFvId, rcsbFvSingleViewer);
            rcsbFvEntity.getTargets().then(targets => {
                WebToolsManager.buildSelectButton(elementSelectId, [entityId].concat(targets).map(t => {
                    return {
                        label: t,
                        onChange: () => {
                            if (t === entityId) {
                                RcsbFvWebApp.buildEntityFv(elementFvId, entityId);
                            } else {
                                RcsbFvWebApp.buildUniprotEntityFv(elementFvId, t, entityId);
                            }
                        }
                    }
                }))
            });
        };

        const entryId:string = entityId.split(TagDelimiter.entity)[0];
        if(this.polymerEntityInstanceMap.has(entryId)) {
            buildSelectAndFv(this.polymerEntityInstanceMap.get(entryId));
        }else{
            const instanceCollector: EntitySequenceCollector = new EntitySequenceCollector();
            instanceCollector.collect({entry_id:entryId}).then(result=> {
                this.polymerEntityInstanceMap.set(entryId,new PolymerEntityInstance(result));
                buildSelectAndFv(new PolymerEntityInstance(result));
            });
        }

    }

    private static buildEntityFv(elementId: string, entityId: string): void {

        const buildSelectAndFv: (p: PolymerEntityInstance)=>void = (p: PolymerEntityInstance)=> {
            if (RcsbFvWebApp.rcsbFvManager.has(elementId)) {
                const rcsbFvEntity: RcsbFvEntity = new RcsbFvEntity(elementId, RcsbFvWebApp.rcsbFvManager.get(elementId).rcsbFv);
                rcsbFvEntity.setPolymerEntityInstance(p);
                rcsbFvEntity.build(entityId, true);
            } else {
                const rcsbFvSingleViewer: RcsbFvSingleViewerInterface = {
                    rcsbFv: new RcsbFv({
                        rowConfigData: null,
                        boardConfigData: null,
                        elementId: elementId
                    }),
                    elementId: elementId,
                    queryId: entityId
                };
                const rcsbFvEntity: RcsbFvEntity = new RcsbFvEntity(elementId, rcsbFvSingleViewer.rcsbFv);
                rcsbFvEntity.setPolymerEntityInstance(p);
                rcsbFvEntity.build(entityId, false);
                RcsbFvWebApp.rcsbFvManager.set(elementId, rcsbFvSingleViewer);
            }
        };

        const entryId:string = entityId.split(TagDelimiter.entity)[0];
        if(this.polymerEntityInstanceMap.has(entryId)) {
            buildSelectAndFv(this.polymerEntityInstanceMap.get(entryId));
        }else{
            const instanceCollector: EntitySequenceCollector = new EntitySequenceCollector();
            instanceCollector.collect({entry_id:entryId}).then(result=> {
                this.polymerEntityInstanceMap.set(entryId,new PolymerEntityInstance(result));
                buildSelectAndFv(new PolymerEntityInstance(result));
            });
        }
    }

    public static buildInstanceSequenceFv(elementId:string, elementSelectId:string, entryId: string): void {
        const instanceCollector: EntitySequenceCollector = new EntitySequenceCollector();
        instanceCollector.collect({entry_id:entryId}).then(result=>{
            RcsbFvWebApp.buildInstanceFv(elementId,result[0].rcsbId);
            WebToolsManager.buildSelectButton(elementSelectId,result.map(instance=>{
                return{
                    label: instance.entryId+"."+instance.authId,
                    onChange:()=>{
                        RcsbFvWebApp.buildInstanceFv(elementId,instance.rcsbId);
                    }
                }
            }));
        }).catch(error=>{
            console.error(error);
        });
    }

    private static buildInstanceFv(elementId: string, instanceId: string): void {
        if(RcsbFvWebApp.rcsbFvManager.has(elementId)){
            const rcsbFvInstance:RcsbFvInstance = new RcsbFvInstance(elementId, RcsbFvWebApp.rcsbFvManager.get(elementId).rcsbFv);
            rcsbFvInstance.build(instanceId, true);
        } else {
            const rcsbFvSingleViewer: RcsbFvSingleViewerInterface = {
                rcsbFv: new RcsbFv({
                    rowConfigData: null,
                    boardConfigData: null,
                    elementId: elementId
                }),
                elementId: elementId,
                queryId: instanceId
            };
            const rcsbFvInstance:RcsbFvInstance = new RcsbFvInstance(elementId, rcsbFvSingleViewer.rcsbFv);
            rcsbFvInstance.build(instanceId, false);
            RcsbFvWebApp.rcsbFvManager.set(elementId, rcsbFvSingleViewer);
        }
    }

}

