import {RcsbFvAdditionalConfig} from "../RcsbFvModule/RcsbFvModuleInterface";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {RcsbFvUniprotEntity} from "../RcsbFvModule/RcsbFvUniprotEntity";
import {TagDelimiter} from "../../RcsbUtils/TagDelimiter";
import {RcsbFvUniprotInstance} from "../RcsbFvModule/RcsbFvUniprotInstance";
import {RcsbFvUniprot} from "../RcsbFvModule/RcsbFvUniprot";
import {PolymerEntityInstanceInterface} from "../../RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {rcsbRequestCtxManager} from "../../RcsbRequest/RcsbRequestContextManager";

export class RcsbFvUniprotBuilder {

    static async buildUniprotMultipleEntitySequenceFv(elementFvId: string, elementSelectId:string, upAcc: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface> {
        const ALL:string = "ALL";
        return new Promise<RcsbFvModulePublicInterface>(async (resolve, reject)=>{
            const rcsbFvUniprot: RcsbFvModulePublicInterface = await RcsbFvUniprotBuilder.buildUniprotFv(elementFvId, upAcc, {...additionalConfig, boardConfig:{rowTitleWidth:210}});
            resolve(rcsbFvUniprot);
            const targets: Array<string>  = await rcsbFvUniprot.getTargets();
            RcsbFvCoreBuilder.buildSelectButton(elementFvId, elementSelectId, [ALL].concat(targets.sort((a: string,b: string)=>{
                    return a.localeCompare(b);
                })).map(entityId => {
                    return {
                        label: entityId === ALL ? entityId+" ("+targets.length+")": entityId,
                        onChange: async () => {
                            RcsbFvCoreBuilder.clearAdditionalSelectButton(elementFvId, elementSelectId);
                            if (entityId === ALL) {
                                await RcsbFvUniprotBuilder.buildUniprotFv(elementFvId, upAcc, additionalConfig);
                            } else {
                                const entryId: string = entityId.split(TagDelimiter.entity)[0];
                                const entityInstanceTranslator: PolymerEntityInstanceTranslate = await rcsbRequestCtxManager.getEntityToInstance(entryId);
                                const result:Array<PolymerEntityInstanceInterface> = entityInstanceTranslator.getData().filter(r=>{
                                    return r.entityId === entityId.split(TagDelimiter.entity)[1];
                                });
                                await RcsbFvUniprotBuilder.buildUniprotEntityInstanceFv(
                                    elementFvId,
                                    upAcc,
                                    result[0].entryId+TagDelimiter.entity+result[0].entityId,
                                    result[0].entryId+TagDelimiter.instance+result[0].asymId,
                                    additionalConfig
                                );
                                RcsbFvCoreBuilder.addSelectButton(elementFvId, elementSelectId,result.map(instance=>{
                                    return{
                                        name: instance.taxNames.length > 0 ? instance.name+" - "+instance.taxNames.join(", ") : instance.name,
                                        label: (instance.authId === instance.asymId ? instance.authId : `${instance.asymId} [auth ${instance.authId}]`)+" - "+instance.name,
                                        shortLabel: (instance.authId === instance.asymId ? instance.authId : `${instance.asymId} [auth ${instance.authId}]`),
                                        onChange: async ()=>{
                                            await RcsbFvUniprotBuilder.buildUniprotEntityInstanceFv(
                                                elementFvId,
                                                upAcc,
                                                instance.entryId+TagDelimiter.entity+instance.entityId,
                                                instance.entryId+TagDelimiter.instance+instance.asymId,
                                                additionalConfig
                                            );
                                        }
                                    }
                                }),{addTitle:true});
                            }
                        }
                    }
                })
            )
        });
    }

    static async buildUniprotFv(elementId: string, upAcc: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>((resolve,reject)=> {
            try {
                RcsbFvCoreBuilder.createFv({
                    elementId: elementId,
                    fvModuleI: RcsbFvUniprot,
                    config: {
                        upAcc: upAcc,
                        additionalConfig: {
                            rcsbContext:{
                                upAcc:upAcc
                            },
                            ...additionalConfig
                        },
                        resolve: resolve
                    }
                });
            }catch(e) {
                reject(e);
            }
        });
    }

    static async buildUniprotEntityFv(elementId: string, upAcc: string, entityId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>(async (resolve,reject)=> {
            try {
                const entryId: string = entityId.split(TagDelimiter.entity)[0];
                RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(elementId, entryId, RcsbFvUniprotEntity, {
                    upAcc: upAcc,
                    entityId: entityId,
                    additionalConfig: {
                        rcsbContext:{
                            entryId: entityId.split(TagDelimiter.entity)[0],
                            entityId: entityId.split(TagDelimiter.entity)[1],
                            upAcc: upAcc,
                        },
                        ...additionalConfig
                    },
                    resolve: resolve
                });
            }catch (e) {
                reject(e);
            }
        });
    }

    static async buildUniprotEntityInstanceFv(elementId: string, upAcc: string, entityId: string, instanceId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>(async (resolve,reject)=> {
            try {
                const entryId: string = entityId.split(TagDelimiter.entity)[0];
                await RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(elementId, entryId, RcsbFvUniprotInstance, {
                    upAcc: upAcc,
                    entityId: entityId,
                    instanceId: instanceId,
                    additionalConfig: {
                        rcsbContext:{
                            entryId: entityId.split(TagDelimiter.entity)[0],
                            entityId: entityId.split(TagDelimiter.entity)[1],
                            asymId: instanceId,
                            upAcc: upAcc,
                        },
                        ...additionalConfig
                    },
                    resolve: resolve
                });
            }catch (e) {
                reject(e);
            }
        });
    }
}