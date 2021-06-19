import {RcsbFvAdditionalConfig, RcsbFvModuleInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {RcsbFvUniprotEntity} from "../RcsbFvModule/RcsbFvUniprotEntity";
import {TagDelimiter} from "../Utils/TagDelimiter";
import {RcsbFvUniprotInstance} from "../RcsbFvModule/RcsbFvUniprotInstance";
import {RcsbFvUniprot} from "../RcsbFvModule/RcsbFvUniprot";
import {EntryInstancesCollector, PolymerEntityInstanceInterface} from "../CollectTools/EntryInstancesCollector";
import {SequenceReference} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {rcsbFvCtxManager} from "./RcsbFvContextManager";
import {RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFv} from "@rcsb/rcsb-saguaro";

export class RcsbFvUniprotBuilder {

    static async buildUniprotMultipleEntitySequenceFv(elementFvId: string, elementSelectId:string, upAcc: string): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>(async (resolve, reject)=>{
            rcsbFvCtxManager.setBoardConfig({rowTitleWidth:210});
            const rcsbFvSingleViewer: RcsbFv = RcsbFvCoreBuilder.buildRcsbFvSingleViewer(elementFvId);
            const ALL:string = "ALL";
            const rcsbFvUniprot: RcsbFvModuleInterface = new RcsbFvUniprot(elementFvId, rcsbFvSingleViewer);
            rcsbFvUniprot.build({upAcc:upAcc, resolve:resolve});
            rcsbFvCtxManager.setFv(elementFvId, rcsbFvSingleViewer);
            const targets: Array<string>  = await rcsbFvUniprot.getTargets();
            RcsbFvCoreBuilder.buildSelectButton(elementFvId, elementSelectId, [ALL].concat(targets.sort((a: string,b: string)=>{
                return a.localeCompare(b);
            })).map(t => {
                return {
                    label: t === ALL ? t+" ("+targets.length+")": t,
                    onChange: async () => {
                        if (t === ALL) {
                            RcsbFvCoreBuilder.clearAdditionalSelectButton(elementFvId, elementSelectId);
                            await RcsbFvUniprotBuilder.buildUniprotFv(elementFvId, upAcc);
                        } else {
                            const instanceCollector: EntryInstancesCollector = new EntryInstancesCollector();
                            const rawResult: Array<PolymerEntityInstanceInterface> = await instanceCollector.collect({entry_id:t.split(TagDelimiter.entity)[0]});
                            rcsbFvCtxManager.setEntityToInstance(t.split(TagDelimiter.entity)[0],new PolymerEntityInstanceTranslate(rawResult));
                            const result:Array<PolymerEntityInstanceInterface> = rawResult.filter(r=>{
                                return r.entityId === t.split(TagDelimiter.entity)[1];
                            });
                            const refName:string = SequenceReference.PdbInstance.replace("_"," ");
                            const labelPrefix: string = refName+" "+TagDelimiter.sequenceTitle+result[0].entryId+TagDelimiter.instance;
                            await RcsbFvUniprotBuilder.buildUniprotEntityInstanceFv(
                                elementFvId,
                                upAcc,
                                result[0].entryId+TagDelimiter.entity+result[0].entityId,
                                result[0].entryId+TagDelimiter.instance+result[0].asymId
                            );
                            RcsbFvCoreBuilder.addSelectButton(elementFvId, elementSelectId,result.map(instance=>{
                                return{
                                    name: instance.taxIds.length > 0 ? instance.names+" - "+instance.taxIds.join(", ") : instance.names,
                                    label: (instance.authId === instance.asymId ? instance.authId : `${instance.asymId} [auth ${instance.authId}]`)+" - "+instance.names,
                                    shortLabel: (instance.authId === instance.asymId ? instance.authId : `${instance.asymId} [auth ${instance.authId}]`),
                                    onChange: async ()=>{
                                        await RcsbFvUniprotBuilder.buildUniprotEntityInstanceFv(
                                            elementFvId,
                                            upAcc,
                                            instance.entryId+TagDelimiter.entity+instance.entityId,
                                            instance.entryId+TagDelimiter.instance+instance.asymId
                                        );
                                    }
                                }
                            }),{addTitle:true});
                        }
                    }
                }
            }))
        });
    }

    static async buildUniprotFv(elementId: string, upAcc: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>((resolve,reject)=> {
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

    static async buildUniprotEntityFv(elementId: string, upAcc: string, entityId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>(async (resolve,reject)=> {
            try {
                const buildFv: (p: PolymerEntityInstanceTranslate) => Promise<RcsbFvModulePublicInterface> = RcsbFvCoreBuilder.createFvBuilder(elementId, RcsbFvUniprotEntity, {
                    upAcc: upAcc,
                    entityId: entityId,
                    additionalConfig: additionalConfig,
                    resolve: resolve
                });
                const entryId: string = entityId.split(TagDelimiter.entity)[0];
                await RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(entryId, buildFv);
            }catch (e) {
                reject(e);
            }
        });
    }

    static async buildUniprotEntityInstanceFv(elementId: string, upAcc: string, entityId: string, instanceId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>(async (resolve,reject)=> {
            try {
                const buildFv: (p: PolymerEntityInstanceTranslate) => Promise<RcsbFvModulePublicInterface> = RcsbFvCoreBuilder.createFvBuilder(elementId, RcsbFvUniprotInstance, {
                    upAcc: upAcc,
                    entityId: entityId,
                    instanceId: instanceId,
                    additionalConfig: additionalConfig,
                    resolve: resolve
                });
                const entryId: string = entityId.split(TagDelimiter.entity)[0];
                await RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(entryId, buildFv);
            }catch (e) {
                reject(e);
            }
        });
    }
}