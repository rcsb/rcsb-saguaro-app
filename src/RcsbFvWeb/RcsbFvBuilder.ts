import {RcsbFv} from '@bioinsilico/rcsb-saguaro';

import {RcsbFvEntity} from "./RcsbFvModule/RcsbFvEntity";
import {RcsbFvInstance} from "./RcsbFvModule/RcsbFvInstance";
import {RcsbFvUniprot} from "./RcsbFvModule/RcsbFvUniprot";
import {WebToolsManager} from "./WebTools/WebToolsManager";
import {RcsbFvUniprotEntity} from "./RcsbFvModule/RcsbFvUniprotEntity";
import {EntryInstancesCollector, PolymerEntityInstanceInterface} from "./CollectTools/EntryInstancesCollector";
import {PolymerEntityInstanceTranslate} from "./Utils/PolymerEntityInstanceTranslate";
import {TagDelimiter} from "./Utils/TagDelimiter";
import { SequenceReference} from "../RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    RcsbFvAdditionalConfig,
    RcsbFvModuleBuildInterface,
    RcsbFvModuleInterface
} from "./RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvUniprotInstance} from "./RcsbFvModule/RcsbFvUniprotInstance";

interface RcsbFvSingleViewerInterface {
    elementId: string;
    rcsbFv: RcsbFv;
}

export class RcsbFvBuilder {
    private static readonly rcsbFvManager: Map<string, RcsbFvSingleViewerInterface> = new Map<string, RcsbFvSingleViewerInterface>();
    private static readonly polymerEntityInstanceMap: Map<string,PolymerEntityInstanceTranslate> = new Map<string, PolymerEntityInstanceTranslate>();

    public static getRcsbFv(elementFvId: string): RcsbFv{
        return this.rcsbFvManager.get(elementFvId).rcsbFv;
    }

    public static buildMultipleAlignmentSequenceFv(elementFvId: string, elementSelectId:string, upAcc: string): void {
        const rcsbFvSingleViewer: RcsbFvSingleViewerInterface = this.buildRcsbFvSingleViewer(elementFvId);
        const ALL:string = "ALL";
        const rcsbFvUniprot: RcsbFvUniprot = new RcsbFvUniprot(elementFvId, rcsbFvSingleViewer.rcsbFv);
        rcsbFvUniprot.build({upAcc:upAcc,updateFlag:false});
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
                                const labelPrefix: string = refName+" "+TagDelimiter.sequenceTitle+result[0].entryId+TagDelimiter.instance;
                                RcsbFvBuilder.buildUniprotInstanceFv(
                                    elementFvId,
                                    upAcc,
                                    result[0].entryId+TagDelimiter.entity+result[0].entityId,
                                    result[0].entryId+TagDelimiter.instance+result[0].asymId
                                );
                                WebToolsManager.additionalSelectButton(elementSelectId,result.map(instance=>{
                                    return{
                                        name: instance.taxIds.length > 0 ? instance.names+" - "+instance.taxIds.join(", ") : instance.names,
                                        label: labelPrefix+instance.authId+" - "+instance.names,
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
        const buildFv: (p: PolymerEntityInstanceTranslate)=>void = RcsbFvBuilder.createFvBuilder(elementId,RcsbFvUniprotInstance,{upAcc:upAcc,entityId:entityId,instanceId:instanceId,additionalConfig:additionalConfig});
        const entryId:string = entityId.split(TagDelimiter.entity)[0];
        RcsbFvBuilder.buildFv(entryId,buildFv);
    }

    public static buildUniprotFv(elementId: string, upAcc: string): void {
        RcsbFvBuilder.createFv(elementId, RcsbFvUniprot, {upAcc:upAcc});
    }

    public static buildUniprotEntityFv(elementId: string, upAcc: string, entityId: string, additionalConfig?:RcsbFvAdditionalConfig): void {
        const buildFv: (p: PolymerEntityInstanceTranslate)=>void = RcsbFvBuilder.createFvBuilder(elementId,RcsbFvUniprotEntity,{upAcc:upAcc,entityId:entityId,additionalConfig:additionalConfig});
        const entryId:string = entityId.split(TagDelimiter.entity)[0];
        RcsbFvBuilder.buildFv(entryId,buildFv);
    }

    public static buildEntitySummaryFv(elementFvId: string, elementSelectId:string, entityId:string): void {
        const rcsbFvSingleViewer: RcsbFvSingleViewerInterface = this.buildRcsbFvSingleViewer(elementFvId);
        const buildSelectAndFv: (p: PolymerEntityInstanceTranslate)=>void = (p: PolymerEntityInstanceTranslate)=>{
            const rcsbFvEntity: RcsbFvEntity = new RcsbFvEntity(elementFvId, rcsbFvSingleViewer.rcsbFv);
            rcsbFvEntity.setPolymerEntityInstance(p);
            rcsbFvEntity.build({entityId:entityId,updateFlag:false});
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
        const buildFv: (p: PolymerEntityInstanceTranslate)=>void = RcsbFvBuilder.createFvBuilder(elementId,RcsbFvEntity,{entityId:entityId});
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
                    name: instance.names+" - "+instance.taxIds.join(", "),
                    label: instance.entryId+TagDelimiter.instance+instance.authId+" - "+instance.names,
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

    private static buildRcsbFvSingleViewer(elementId: string): RcsbFvSingleViewerInterface{
        return{
            rcsbFv: new RcsbFv({
                rowConfigData: null,
                boardConfigData: null,
                elementId: elementId
            }),
            elementId: elementId
        };
    }

    private static buildInstanceFv(elementId: string, instanceId: string): void {
        const buildFv: (p: PolymerEntityInstanceTranslate)=>void = RcsbFvBuilder.createFvBuilder(elementId,RcsbFvInstance,{instanceId:instanceId});
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

    private static createFvBuilder(
        elementId: string,
        fvModuleI: new (elementId:string, rcsbFv: RcsbFv) => RcsbFvModuleInterface,
        config: Omit<RcsbFvModuleBuildInterface, 'updateFlag'>
    ): ((p: PolymerEntityInstanceTranslate)=>void) {
        return (p: PolymerEntityInstanceTranslate)=>{
            RcsbFvBuilder.createFv(elementId,fvModuleI,config,p);
        }
    }

    private static createFv(
        elementId: string,
        fvModuleI: new (elementId:string, rcsbFv: RcsbFv) => RcsbFvModuleInterface,
        config: Omit<RcsbFvModuleBuildInterface, 'updateFlag'>,
        p?: PolymerEntityInstanceTranslate
    ): void {
        if (RcsbFvBuilder.rcsbFvManager.has(elementId)) {
            const rcsbFvInstance: RcsbFvModuleInterface = new fvModuleI(elementId, RcsbFvBuilder.rcsbFvManager.get(elementId).rcsbFv);
            if(p!=null) rcsbFvInstance.setPolymerEntityInstance(p);
            rcsbFvInstance.build({...config,updateFlag:true});
        } else {
            const rcsbFvSingleViewer: RcsbFvSingleViewerInterface = this.buildRcsbFvSingleViewer(elementId);
            const rcsbFvInstance: RcsbFvModuleInterface = new fvModuleI(elementId, rcsbFvSingleViewer.rcsbFv);
            if(p!=null) rcsbFvInstance.setPolymerEntityInstance(p);
            rcsbFvInstance.build({...config,updateFlag:false});
            RcsbFvBuilder.rcsbFvManager.set(elementId, rcsbFvSingleViewer);
        }
    }
}

