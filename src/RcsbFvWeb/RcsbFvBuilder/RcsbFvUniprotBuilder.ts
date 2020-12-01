import {RcsbFvAdditionalConfig} from "../RcsbFvModule/RcsbFvModuleInterface";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {RcsbFvUniprotEntity} from "../RcsbFvModule/RcsbFvUniprotEntity";
import {TagDelimiter} from "../Utils/TagDelimiter";
import {RcsbFvUniprotInstance} from "../RcsbFvModule/RcsbFvUniprotInstance";
import {RcsbFvUniprot} from "../RcsbFvModule/RcsbFvUniprot";
import {WebToolsManager} from "../WebTools/WebToolsManager";
import {EntryInstancesCollector, PolymerEntityInstanceInterface} from "../CollectTools/EntryInstancesCollector";
import {SequenceReference} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {buildUniprotEntityInstanceFv, buildUniprotFv} from "../RcsbFvBuilder";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {rcsbFvCtxManager} from "./RcsbFvContextManager";
import {RcsbFv} from "@rcsb/rcsb-saguaro";

export class RcsbFvUniprotBuilder {

    static buildUniprotMultipleEntitySequenceFv(elementFvId: string, elementSelectId:string, upAcc: string): void {
        rcsbFvCtxManager.setBoardConfig({rowTitleWidth:210});
        const rcsbFvSingleViewer: RcsbFv = RcsbFvCoreBuilder.buildRcsbFvSingleViewer(elementFvId);
        const ALL:string = "ALL";
        const rcsbFvUniprot: RcsbFvUniprot = new RcsbFvUniprot(elementFvId, rcsbFvSingleViewer);
        rcsbFvUniprot.build({upAcc:upAcc});
        rcsbFvCtxManager.setFv(elementFvId, rcsbFvSingleViewer);
        rcsbFvUniprot.getTargets().then(targets => {
            RcsbFvCoreBuilder.buildSelectButton(elementFvId, elementSelectId, [ALL].concat(targets.sort((a: string,b: string)=>{
                return a.localeCompare(b);
            })).map(t => {
                return {
                    label: t === ALL ? t+" ("+targets.length+")": t,
                    onChange: () => {
                        if (t === ALL) {
                            RcsbFvCoreBuilder.clearAdditionalSelectButton(elementFvId, elementSelectId);
                            buildUniprotFv(elementFvId, upAcc);
                        } else {
                            const instanceCollector: EntryInstancesCollector = new EntryInstancesCollector();
                            instanceCollector.collect({entry_id:t.split(TagDelimiter.entity)[0]}).then(rawResult=>{
                                rcsbFvCtxManager.setEntityToInstance(t.split(TagDelimiter.entity)[0],new PolymerEntityInstanceTranslate(rawResult));
                                const result:Array<PolymerEntityInstanceInterface> = rawResult.filter(r=>{
                                    return r.entityId === t.split(TagDelimiter.entity)[1];
                                });
                                const refName:string = SequenceReference.PdbInstance.replace("_"," ");
                                const labelPrefix: string = refName+" "+TagDelimiter.sequenceTitle+result[0].entryId+TagDelimiter.instance;
                                buildUniprotEntityInstanceFv(
                                    elementFvId,
                                    upAcc,
                                    result[0].entryId+TagDelimiter.entity+result[0].entityId,
                                    result[0].entryId+TagDelimiter.instance+result[0].asymId
                                );
                                RcsbFvCoreBuilder.addSelectButton(elementFvId, elementSelectId,result.map(instance=>{
                                    return{
                                        name: instance.taxIds.length > 0 ? instance.names+" - "+instance.taxIds.join(", ") : instance.names,
                                        label: labelPrefix+instance.authId+" - "+instance.names,
                                        shortLabel: instance.authId,
                                        onChange:()=>{
                                            buildUniprotEntityInstanceFv(
                                                elementFvId,
                                                upAcc,
                                                instance.entryId+TagDelimiter.entity+instance.entityId,
                                                instance.entryId+TagDelimiter.instance+instance.asymId
                                            );
                                        }
                                    }
                                }),{addTitle:true});
                            });
                        }
                    }
                }
            }))
        });
    }

    static buildUniprotFv(elementId: string, upAcc: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<null> {
        return new Promise<null>((resolve,reject)=> {
            try {
                RcsbFvCoreBuilder.createFv({
                    elementId: elementId,
                    fvModuleI: RcsbFvUniprot,
                    config: {upAcc: upAcc, additionalConfig: additionalConfig, resolve: resolve}
                });
            }catch(e) {
                reject(e);
            }
        });
    }

    static buildUniprotEntityFv(elementId: string, upAcc: string, entityId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<null> {
        return new Promise<null>((resolve,reject)=> {
            try {
                const buildFv: (p: PolymerEntityInstanceTranslate) => void = RcsbFvCoreBuilder.createFvBuilder(elementId, RcsbFvUniprotEntity, {
                    upAcc: upAcc,
                    entityId: entityId,
                    additionalConfig: additionalConfig,
                    resolve: resolve
                });
                const entryId: string = entityId.split(TagDelimiter.entity)[0];
                RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(entryId, buildFv);
            }catch (e) {
                reject(e);
            }
        });
    }

    static buildUniprotEntityInstanceFv(elementId: string, upAcc: string, entityId: string, instanceId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<null> {
        return new Promise<null>((resolve,reject)=> {
            try {
                const buildFv: (p: PolymerEntityInstanceTranslate) => void = RcsbFvCoreBuilder.createFvBuilder(elementId, RcsbFvUniprotInstance, {
                    upAcc: upAcc,
                    entityId: entityId,
                    instanceId: instanceId,
                    additionalConfig: additionalConfig,
                    resolve: resolve
                });
                const entryId: string = entityId.split(TagDelimiter.entity)[0];
                RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(entryId, buildFv);
            }catch (e) {
                reject(e);
            }
        });
    }
}