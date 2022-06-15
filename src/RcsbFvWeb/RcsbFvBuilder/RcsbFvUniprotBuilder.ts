import {RcsbContextType, RcsbFvAdditionalConfig} from "../RcsbFvModule/RcsbFvModuleInterface";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {RcsbFvUniprotEntity} from "../RcsbFvModule/RcsbFvUniprotEntity";
import {TagDelimiter} from "../../RcsbUtils/Helpers/TagDelimiter";
import {RcsbFvUniprotInstance} from "../RcsbFvModule/RcsbFvUniprotInstance";
import {RcsbFvUniprot} from "../RcsbFvModule/RcsbFvUniprot";
import {PolymerEntityInstanceInterface} from "../../RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {rcsbRequestCtxManager} from "../../RcsbRequest/RcsbRequestContextManager";

export interface UniprotSequenceOnchangeInterface extends Partial<PolymerEntityInstanceInterface> {
    upAcc:string;
}

export interface UniprotSequenceConfig {
    beforeChangeCallback?:(x: UniprotSequenceOnchangeInterface, module:RcsbFvModulePublicInterface|undefined)=>undefined|RcsbContextType;
    onChangeCallback?:(x: UniprotSequenceOnchangeInterface, module:RcsbFvModulePublicInterface)=>void;
}

const ALL:string = "ALL";

//TODO Find a better structure for change callbacks
export class RcsbFvUniprotBuilder {

    static async buildUniprotMultipleEntitySequenceFv(elementFvId:string, elementSelectId:string, upAcc:string, config:UniprotSequenceConfig = {}, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>(async (resolve, reject)=>{
            let externalContext: RcsbContextType | undefined;
            if (typeof config.beforeChangeCallback === "function")
                externalContext = config.beforeChangeCallback({
                    upAcc
                },undefined);
            const rcsbFvUniprot: RcsbFvModulePublicInterface = await RcsbFvUniprotBuilder.buildUniprotFv(elementFvId, upAcc, {
                ...additionalConfig,
                rcsbContext: {
                    ...additionalConfig?.rcsbContext,
                    ...externalContext
                },
                boardConfig:{rowTitleWidth:210}
            });
            if (typeof config.onChangeCallback === "function")
                config.onChangeCallback({
                    upAcc
                }, rcsbFvUniprot);
            resolve(rcsbFvUniprot);
            const targets: Array<string>  = await rcsbFvUniprot.getTargets();
            RcsbFvCoreBuilder.buildSelectButton(elementFvId, elementSelectId, [ALL].concat(targets).map(entityId => {
                    return {
                        label: entityId === ALL ? entityId+" ("+targets.length+")": entityId,
                        onChange: async () => {
                            RcsbFvCoreBuilder.clearAdditionalSelectButton(elementFvId, elementSelectId);
                            if (entityId === ALL) {
                                let externalContext: RcsbContextType | undefined;
                                if (typeof config.beforeChangeCallback === "function")
                                    externalContext = config.beforeChangeCallback({
                                        upAcc
                                    }, rcsbFvUniprot);
                                await RcsbFvUniprotBuilder.buildUniprotFv(elementFvId, upAcc, {
                                    ...additionalConfig,
                                    rcsbContext: {
                                        ...additionalConfig?.rcsbContext,
                                        ...externalContext
                                    }
                                });
                                if (typeof config.onChangeCallback === "function")
                                    config.onChangeCallback({
                                        upAcc
                                    }, rcsbFvUniprot);
                            } else {
                                const entryId: string = TagDelimiter.parseEntity(entityId).entryId;
                                const entityInstanceTranslator: PolymerEntityInstanceTranslate = await rcsbRequestCtxManager.getEntityToInstance(entryId);
                                const result:Array<PolymerEntityInstanceInterface> = entityInstanceTranslator.getData().filter(r=>{
                                    return r.entityId === TagDelimiter.parseEntity(entityId).entityId;
                                });
                                let externalContext: RcsbContextType | undefined;
                                if (typeof config.beforeChangeCallback === "function")
                                    externalContext = config.beforeChangeCallback({
                                        ...result[0],
                                        upAcc
                                    }, rcsbFvUniprot);
                                await RcsbFvUniprotBuilder.buildUniprotEntityInstanceFv(
                                    elementFvId,
                                    upAcc,
                                    result[0].entryId+TagDelimiter.entity+result[0].entityId,
                                    result[0].entryId+TagDelimiter.instance+result[0].asymId,
                                    {
                                        ...additionalConfig,
                                        rcsbContext:{
                                            ...additionalConfig?.rcsbContext,
                                            ...externalContext
                                        }
                                    }
                                );
                                if (typeof config.onChangeCallback === "function")
                                    config.onChangeCallback({
                                        ...result[0],
                                        upAcc
                                    }, rcsbFvUniprot);
                                RcsbFvCoreBuilder.addSelectButton(elementFvId, elementSelectId,result.map(instance=>{
                                    return{
                                        name: instance.taxNames.length > 0 ? instance.name+" - "+instance.taxNames.join(", ") : instance.name,
                                        label: (instance.authId === instance.asymId ? instance.authId : `${instance.asymId} [auth ${instance.authId}]`)+" - "+instance.name,
                                        shortLabel: (instance.authId === instance.asymId ? instance.authId : `${instance.asymId} [auth ${instance.authId}]`),
                                        onChange: async ()=>{
                                            let externalContext: RcsbContextType | undefined;
                                            if (typeof config.beforeChangeCallback === "function")
                                                externalContext = config.beforeChangeCallback({
                                                    ...instance,
                                                    upAcc
                                                }, rcsbFvUniprot);
                                            await RcsbFvUniprotBuilder.buildUniprotEntityInstanceFv(
                                                elementFvId,
                                                upAcc,
                                                instance.entryId+TagDelimiter.entity+instance.entityId,
                                                instance.entryId+TagDelimiter.instance+instance.asymId,
                                                {
                                                    ...additionalConfig,
                                                    rcsbContext:{
                                                        ...additionalConfig?.rcsbContext,
                                                        ...externalContext
                                                    }
                                                }
                                            );
                                            if (typeof config.onChangeCallback === "function")
                                                config.onChangeCallback({
                                                    ...instance,
                                                    upAcc
                                                }, rcsbFvUniprot);
                                        }
                                    }
                                }),{addTitle:true});
                            }
                        }
                    }
                })
            );
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
                const entryId: string = TagDelimiter.parseEntity(entityId).entryId;
                await RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(elementId, entryId, RcsbFvUniprotEntity, {
                    upAcc: upAcc,
                    entityId: entityId,
                    additionalConfig: {
                        rcsbContext:{
                            ...TagDelimiter.parseEntity(entityId),
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
                const entryId: string = TagDelimiter.parseEntity(entityId).entryId;
                await RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(elementId, entryId, RcsbFvUniprotInstance, {
                    upAcc: upAcc,
                    entityId: entityId,
                    instanceId: instanceId,
                    additionalConfig: {
                        rcsbContext:{
                            ...TagDelimiter.parseEntity(entityId),
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