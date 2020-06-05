import {RcsbFv} from 'rcsb-saguaro';

import {RcsbFvEntity} from "./RcsbFvModule/RcsbFvEntity";
import {RcsbFvInstance} from "./RcsbFvModule/RcsbFvInstance";
import {RcsbFvUniprot} from "./RcsbFvModule/RcsbFvUniprot";
import {WebToolsManager} from "./WebTools/WebToolsManager";
import {RcsbFvUniprotEntity} from "./RcsbFvModule/RcsbFvUniprotEntity";
import {EntryInstancesCollector, PolymerEntityInstanceInterface} from "./CollectTools/EntryInstancesCollector";
import {PolymerEntityInstanceTranslate} from "./Utils/PolymerEntityInstanceTranslate";
import {TagDelimiter} from "./Utils/TagDelimiter";
import { SequenceReference} from "../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAdditionalConfig} from "./RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvUniprotInstance} from "./RcsbFvModule/RcsbFvUniprotInstance";

interface RcsbFvSingleViewerInterface {
    queryId: string;
    elementId: string;
    rcsbFv: RcsbFv;
}

export class RcsbFvBuilder {
    private static rcsbFvManager: Map<string, RcsbFvSingleViewerInterface> = new Map<string, RcsbFvSingleViewerInterface>();
    private static polymerEntityInstanceMap: Map<string,PolymerEntityInstanceTranslate> = new Map<string, PolymerEntityInstanceTranslate>();

    public static buildMultipleAlignmentSequenceFv(elementFvId: string, elementSelectId:string, upAcc: string): void {
        const rcsbFvSingleViewer: RcsbFvSingleViewerInterface = {
            rcsbFv: new RcsbFv({
                rowConfigData: null,
                boardConfigData: null,
                elementId: elementFvId
            }),
            elementId: elementFvId,
            queryId: upAcc
        };

        const ALL:string = "ALL";
        const rcsbFvUniprot: RcsbFvUniprot = new RcsbFvUniprot(elementFvId, rcsbFvSingleViewer.rcsbFv);
        rcsbFvUniprot.build(upAcc, false);
        RcsbFvBuilder.rcsbFvManager.set(elementFvId, rcsbFvSingleViewer);
        rcsbFvUniprot.getTargets().then(targets => {
            WebToolsManager.buildSelectButton(elementSelectId, [ALL].concat(targets.sort((a: string,b: string)=>{
                return a.localeCompare(b);
            })).map(t => {
                return {
                    label: t,
                    onChange: () => {
                        if (t === ALL) {
                            WebToolsManager.clearAdditionalSelectButton();
                            RcsbFvBuilder.buildUniprotFv(elementFvId, upAcc);
                        } else {
                            const instanceCollector: EntryInstancesCollector = new EntryInstancesCollector();
                            instanceCollector.collect({entry_id:t.split(TagDelimiter.entity)[0]}).then(rawResult=>{
                                this.polymerEntityInstanceMap.set(t.split(TagDelimiter.entity)[0],new PolymerEntityInstanceTranslate(rawResult));
                                const result:Array<PolymerEntityInstanceInterface> = rawResult.filter(r=>{
                                    return r.entityId === t.split(TagDelimiter.entity)[1];
                                });
                                const refName:string = SequenceReference.PdbInstance.replace("_"," ");
                                const labelPrefix: string = refName+" "+TagDelimiter.sequenceTitle+result[0].entryId+TagDelimiter.instance+result[0].authId;
                                RcsbFvBuilder.buildUniprotInstanceFv(
                                    elementFvId,
                                    upAcc,
                                    result[0].entryId+TagDelimiter.entity+result[0].entityId,
                                    result[0].entryId+TagDelimiter.instance+result[0].asymId
                                );
                                WebToolsManager.additionalSelectButton(elementSelectId,result.map(instance=>{
                                    return{
                                        name: instance.names[0]+" - "+instance.taxIds.join(", "),
                                        label: labelPrefix+" - "+instance.names[0],
                                        shortLabel: instance.authId,
                                        onChange:()=>{
                                            RcsbFvBuilder.buildUniprotInstanceFv(
                                                elementFvId,
                                                upAcc,
                                                instance.entryId+TagDelimiter.entity+instance.entityId,
                                                instance.entryId+TagDelimiter.instance+instance.asymId
                                            );
                                        }
                                    }
                                }),true);
                            });
                        }
                    }
                }
            }))
        });
    }

    public static buildUniprotInstanceFv(elementId: string, upAcc: string, entityId: string, instanceId: string, additionalConfig?:RcsbFvAdditionalConfig): void {
        const buildFv:(p: PolymerEntityInstanceTranslate)=>void = (p: PolymerEntityInstanceTranslate)=> {
            if(RcsbFvBuilder.rcsbFvManager.has(elementId)){
                const rcsbFvUniprotInstance:RcsbFvUniprotInstance = new RcsbFvUniprotInstance(elementId, RcsbFvBuilder.rcsbFvManager.get(elementId).rcsbFv);
                rcsbFvUniprotInstance.setPolymerEntityInstance(p);
                rcsbFvUniprotInstance.build(upAcc, entityId, instanceId,  true, additionalConfig);
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
                const rcsbFvUniprotInstance:RcsbFvUniprotInstance = new RcsbFvUniprotInstance(elementId, rcsbFvSingleViewer.rcsbFv);
                rcsbFvUniprotInstance.setPolymerEntityInstance(p);
                rcsbFvUniprotInstance.build(upAcc, entityId, instanceId,  false, additionalConfig);
                RcsbFvBuilder.rcsbFvManager.set(elementId, rcsbFvSingleViewer);
            }
        };
        const entryId:string = entityId.split(TagDelimiter.entity)[0];
        RcsbFvBuilder.buildFv(entryId,buildFv);
    }

    public static buildUniprotFv(elementId: string, upAcc: string): void {
        if(RcsbFvBuilder.rcsbFvManager.has(elementId)){
            const rcsbFvUniprot: RcsbFvUniprot = new RcsbFvUniprot(elementId, RcsbFvBuilder.rcsbFvManager.get(elementId).rcsbFv);
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
            RcsbFvBuilder.rcsbFvManager.set(elementId, rcsbFvSingleViewer);
        }
    }

    public static buildUniprotEntityFv(elementId: string, upAcc: string, entityId: string, additionalConfig?:RcsbFvAdditionalConfig): void {
        const buildFv:(p: PolymerEntityInstanceTranslate)=>void = (p: PolymerEntityInstanceTranslate)=> {
            if(RcsbFvBuilder.rcsbFvManager.has(elementId)){
                const rcsbFvUniprot:RcsbFvUniprotEntity = new RcsbFvUniprotEntity(elementId, RcsbFvBuilder.rcsbFvManager.get(elementId).rcsbFv);
                rcsbFvUniprot.setPolymerEntityInstance(p);
                rcsbFvUniprot.build(upAcc, entityId, true, additionalConfig);
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
                rcsbFvUniprot.setPolymerEntityInstance(p);
                rcsbFvUniprot.build(upAcc, entityId, false, additionalConfig);
                RcsbFvBuilder.rcsbFvManager.set(elementId, rcsbFvSingleViewer);
            }
        };
        const entryId:string = entityId.split(TagDelimiter.entity)[0];
        RcsbFvBuilder.buildFv(entryId,buildFv);
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

        const buildSelectAndFv: (p: PolymerEntityInstanceTranslate)=>void = (p: PolymerEntityInstanceTranslate)=>{
            const rcsbFvEntity: RcsbFvEntity = new RcsbFvEntity(elementFvId, rcsbFvSingleViewer.rcsbFv);
            rcsbFvEntity.setPolymerEntityInstance(p);
            rcsbFvEntity.build(entityId, false);
            RcsbFvBuilder.rcsbFvManager.set(elementFvId, rcsbFvSingleViewer);
            rcsbFvEntity.getTargets().then(targets => {
                WebToolsManager.buildSelectButton(elementSelectId, [entityId].concat(targets).map(t => {
                    return {
                        label: t,
                        onChange: () => {
                            if (t === entityId) {
                                RcsbFvBuilder.buildEntityFv(elementFvId, entityId);
                            } else {
                                RcsbFvBuilder.buildUniprotEntityFv(elementFvId, t, entityId);
                            }
                        }
                    }
                }))
            });
        };

        const entryId:string = entityId.split(TagDelimiter.entity)[0];
        RcsbFvBuilder.buildFv(entryId,buildSelectAndFv);

    }

    private static buildEntityFv(elementId: string, entityId: string): void {

        const buildFv: (p: PolymerEntityInstanceTranslate)=>void = (p: PolymerEntityInstanceTranslate)=> {
            if (RcsbFvBuilder.rcsbFvManager.has(elementId)) {
                const rcsbFvEntity: RcsbFvEntity = new RcsbFvEntity(elementId, RcsbFvBuilder.rcsbFvManager.get(elementId).rcsbFv);
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
                RcsbFvBuilder.rcsbFvManager.set(elementId, rcsbFvSingleViewer);
            }
        };

        const entryId:string = entityId.split(TagDelimiter.entity)[0];
        RcsbFvBuilder.buildFv(entryId,buildFv);
    }

    public static buildInstanceSequenceFv(elementId:string, elementSelectId:string, entryId: string): void {
        const instanceCollector: EntryInstancesCollector = new EntryInstancesCollector();
        instanceCollector.collect({entry_id:entryId}).then(result=>{
            this.polymerEntityInstanceMap.set(entryId,new PolymerEntityInstanceTranslate(result));
            RcsbFvBuilder.buildInstanceFv(elementId,result[0].rcsbId);
            WebToolsManager.buildSelectButton(elementSelectId,result.map(instance=>{
                return{
                    name: instance.names[0]+" - "+instance.taxIds.join(", "),
                    label: instance.entryId+TagDelimiter.instance+instance.authId+" - "+instance.names[0],
                    shortLabel: instance.entryId+TagDelimiter.instance+instance.authId,
                    onChange:()=>{
                        RcsbFvBuilder.buildInstanceFv(
                            elementId,
                            instance.rcsbId
                        );
                    }
                }
            }),true);
        }).catch(error=>{
            console.error(error);
            throw error;
        });
    }

    private static buildInstanceFv(elementId: string, instanceId: string): void {

        const buildFv: (p: PolymerEntityInstanceTranslate)=>void = (p: PolymerEntityInstanceTranslate)=> {
            if (RcsbFvBuilder.rcsbFvManager.has(elementId)) {
                const rcsbFvInstance: RcsbFvInstance = new RcsbFvInstance(elementId, RcsbFvBuilder.rcsbFvManager.get(elementId).rcsbFv);
                rcsbFvInstance.setPolymerEntityInstance(p);
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
                const rcsbFvInstance: RcsbFvInstance = new RcsbFvInstance(elementId, rcsbFvSingleViewer.rcsbFv);
                rcsbFvInstance.setPolymerEntityInstance(p);
                rcsbFvInstance.build(instanceId, false);
                RcsbFvBuilder.rcsbFvManager.set(elementId, rcsbFvSingleViewer);
            }
        };
        const entryId:string = instanceId.split(TagDelimiter.instance)[0];
        RcsbFvBuilder.buildFv(entryId,buildFv);
    }

    private static buildFv(entryId: string, f:(p: PolymerEntityInstanceTranslate)=>void){
        if(this.polymerEntityInstanceMap.has(entryId)) {
            f(this.polymerEntityInstanceMap.get(entryId));
        }else{
            const instanceCollector: EntryInstancesCollector = new EntryInstancesCollector();
            instanceCollector.collect({entry_id:entryId}).then(result=> {
                this.polymerEntityInstanceMap.set(entryId,new PolymerEntityInstanceTranslate(result));
                f(this.polymerEntityInstanceMap.get(entryId));
            });
        }
    }

}

