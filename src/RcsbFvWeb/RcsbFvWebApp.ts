import {RcsbFv} from 'rcsb-saguaro';

import {RcsbFvEntity} from "./RcsbFvModule/RcsbFvEntity";
import {RcsbFvInstance} from "./RcsbFvModule/RcsbFvInstance";
import {RcsbFvUniprot} from "./RcsbFvModule/RcsbFvUniprot";
import {WebToolsManager} from "./WebTools/WebToolsManager";
import {RcsbFvUniprotEntity} from "./RcsbFvModule/RcsbFvUniprotEntity";
import {EntryInstancesCollector} from "./CollectTools/EntryInstancesCollector";
import {PolymerEntityInstanceTranslate} from "./Utils/PolymerEntityInstanceTranslate";
import {TagDelimiter} from "./Utils/TagDelimiter";
import {FieldName, FilterInput, OperationType, SequenceReference, Source} from "../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAdditionalConfig} from "./RcsbFvModule/RcsbFvModuleInterface";

interface RcsbFvSingleViewerInterface {
    queryId: string;
    elementId: string;
    rcsbFv: RcsbFv;
}

export class RcsbFvWebApp {
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
        const additionalConfig: RcsbFvAdditionalConfig = {
            sources: [Source.Uniprot,Source.PdbEntity,Source.PdbInstance],

        };
        const ALL:string = "ALL";
        const rcsbFvUniprot: RcsbFvUniprot = new RcsbFvUniprot(elementFvId, rcsbFvSingleViewer.rcsbFv);
        rcsbFvUniprot.build(upAcc, false);
        RcsbFvWebApp.rcsbFvManager.set(elementFvId, rcsbFvSingleViewer);
        rcsbFvUniprot.getTargets().then(targets => {
            WebToolsManager.buildSelectButton(elementSelectId, [ALL].concat(targets).map(t => {
                return {
                    label: t,
                    onChange: () => {
                        if (t === ALL) {
                            RcsbFvWebApp.buildUniprotFv(elementFvId, upAcc);
                        } else {
                            additionalConfig.filters = [{
                                field:FieldName.TargetId,
                                operation:OperationType.Equals,
                                source: Source.PdbEntity,
                                values:[t]
                            },{
                                field:FieldName.TargetId,
                                operation:OperationType.Contains,
                                source:Source.PdbInstance,
                                values:[t.split(TagDelimiter.entity)[0]]
                            }];
                            RcsbFvWebApp.buildUniprotEntityFv(elementFvId, upAcc, t, additionalConfig);
                        }
                    }
                }
            }))
        });
    }

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

    public static buildUniprotEntityFv(elementId: string, upAcc: string, entityId: string, additionalConfig?:RcsbFvAdditionalConfig): void {
        const buildFv:(p: PolymerEntityInstanceTranslate)=>void = (p: PolymerEntityInstanceTranslate)=> {
            if(RcsbFvWebApp.rcsbFvManager.has(elementId)){
                const rcsbFvUniprot:RcsbFvUniprotEntity = new RcsbFvUniprotEntity(elementId, RcsbFvWebApp.rcsbFvManager.get(elementId).rcsbFv);
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
                RcsbFvWebApp.rcsbFvManager.set(elementId, rcsbFvSingleViewer);
            }
        };
        const entryId:string = entityId.split(TagDelimiter.entity)[0];
        RcsbFvWebApp.buildFv(entryId,buildFv);
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
        RcsbFvWebApp.buildFv(entryId,buildSelectAndFv);

    }

    private static buildEntityFv(elementId: string, entityId: string): void {

        const buildFv: (p: PolymerEntityInstanceTranslate)=>void = (p: PolymerEntityInstanceTranslate)=> {
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
        RcsbFvWebApp.buildFv(entryId,buildFv);
    }

    public static buildInstanceSequenceFv(elementId:string, elementSelectId:string, entryId: string): void {
        const instanceCollector: EntryInstancesCollector = new EntryInstancesCollector();
        instanceCollector.collect({entry_id:entryId}).then(result=>{
            const authId: string = SequenceReference.PdbInstance.replace("_"," ")+" "+TagDelimiter.sequenceTitle+result[0].entryId+TagDelimiter.instance+result[0].authId;
            RcsbFvWebApp.buildInstanceFv(elementId,result[0].rcsbId,authId);
            WebToolsManager.buildSelectButton(elementSelectId,result.map(instance=>{
                return{
                    name: instance.names[0]+" - "+instance.taxIds.join(", "),
                    label: instance.entryId+TagDelimiter.instance+instance.authId+" - "+instance.names[0],
                    shortLabel: instance.entryId+TagDelimiter.instance+instance.authId,
                    onChange:()=>{
                        RcsbFvWebApp.buildInstanceFv(
                            elementId,
                            instance.rcsbId,
                            SequenceReference.PdbInstance.replace("_"," ")+" "+TagDelimiter.sequenceTitle+instance.entryId+TagDelimiter.instance+instance.authId
                        );
                    }
                }
            }),true);
        }).catch(error=>{
            console.error(error);
            throw error;
        });
    }

    private static buildInstanceFv(elementId: string, instanceId: string, sequenceTrackTitle: string): void {

        const buildFv: (p: PolymerEntityInstanceTranslate)=>void = (p: PolymerEntityInstanceTranslate)=> {
            if (RcsbFvWebApp.rcsbFvManager.has(elementId)) {
                const rcsbFvInstance: RcsbFvInstance = new RcsbFvInstance(elementId, RcsbFvWebApp.rcsbFvManager.get(elementId).rcsbFv);
                rcsbFvInstance.setPolymerEntityInstance(p);
                rcsbFvInstance.build(instanceId, sequenceTrackTitle, true);
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
                rcsbFvInstance.build(instanceId, sequenceTrackTitle, false);
                RcsbFvWebApp.rcsbFvManager.set(elementId, rcsbFvSingleViewer);
            }
        };
        const entryId:string = instanceId.split(TagDelimiter.instance)[0];
        RcsbFvWebApp.buildFv(entryId,buildFv);
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

