import {
    RcsbContextType,
    RcsbFvAdditionalConfig,
    RcsbFvModuleContainerPublicInterface
} from "../RcsbFvModule/RcsbFvModuleInterface";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {RcsbFvUniprotEntity} from "../RcsbFvModule/RcsbFvUniprotEntity";
import {TagDelimiter} from "../../RcsbUtils/Helpers/TagDelimiter";
import {RcsbFvUniprotInstance} from "../RcsbFvModule/RcsbFvUniprotInstance";
import {RcsbFvUniprot} from "../RcsbFvModule/RcsbFvUniprot";
import {PolymerEntityInstanceInterface} from "../../RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {rcsbRequestCtxManager} from "../../RcsbRequest/RcsbRequestContextManager";
import {DataContainer} from "../../RcsbUtils/Helpers/DataContainer";

export interface UniprotSequenceOnchangeInterface extends Partial<PolymerEntityInstanceInterface>{
    upAcc:string;
}

export interface UniprotSequenceConfig {
    beforeChangeCallback?:(x: UniprotSequenceOnchangeInterface)=>undefined|RcsbContextType;
    onChangeCallback?:(x: UniprotSequenceOnchangeInterface)=>void;
}

const ALL:string = "ALL";

//TODO Find a better structure for change callbacks
export class RcsbFvUniprotBuilder {

    static async buildUniprotMultipleEntitySequenceFv(elementFvId:string, elementSelectId:string, upAcc:string, config:UniprotSequenceConfig = {}, additionalConfig?:RcsbFvAdditionalConfig): RcsbFvModuleContainerPublicInterface {
        let externalContext: RcsbContextType | undefined;
        if (typeof config.beforeChangeCallback === "function")
            externalContext = config.beforeChangeCallback({
                upAcc
            });
        const module: Promise<RcsbFvModulePublicInterface> = RcsbFvUniprotBuilder.buildUniprotFv(elementFvId, upAcc, {
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
            });
        const container: DataContainer<Promise<RcsbFvModulePublicInterface>> = new DataContainer<Promise<RcsbFvModulePublicInterface>>(module);
        const targets: Array<string>  = await (await container.get()).getTargets();
        RcsbFvCoreBuilder.buildSelectButton(elementFvId, elementSelectId, [ALL].concat(targets.sort((a: string,b: string)=>{
                return a.localeCompare(b);
            })).map(entityId => {
                return {
                    label: entityId === ALL ? entityId+" ("+targets.length+")": entityId,
                    onChange: async () => {
                        RcsbFvCoreBuilder.clearAdditionalSelectButton(elementFvId, elementSelectId);
                        if (entityId === ALL) {
                            let externalContext: RcsbContextType | undefined;
                            if (typeof config.beforeChangeCallback === "function")
                                externalContext = config.beforeChangeCallback({
                                    upAcc
                                });
                            container.set(RcsbFvUniprotBuilder.buildUniprotFv(elementFvId, upAcc, {
                                ...additionalConfig,
                                rcsbContext: {
                                    ...additionalConfig?.rcsbContext,
                                    ...externalContext
                                }
                            }));
                            if (typeof config.onChangeCallback === "function")
                                config.onChangeCallback({
                                    upAcc
                                });
                        } else {
                            const entryId: string = entityId.split(TagDelimiter.entity)[0];
                            const entityInstanceTranslator: PolymerEntityInstanceTranslate = await rcsbRequestCtxManager.getEntityToInstance(entryId);
                            const result:Array<PolymerEntityInstanceInterface> = entityInstanceTranslator.getData().filter(r=>{
                                return r.entityId === entityId.split(TagDelimiter.entity)[1];
                            });
                            let externalContext: RcsbContextType | undefined;
                            if (typeof config.beforeChangeCallback === "function")
                                externalContext = config.beforeChangeCallback({
                                    ...result[0],
                                    upAcc
                                });
                            container.set(RcsbFvUniprotBuilder.buildUniprotEntityInstanceFv(
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
                            ));
                            if (typeof config.onChangeCallback === "function")
                                config.onChangeCallback({
                                    ...result[0],
                                    upAcc
                                });
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
                                            });
                                        container.set(RcsbFvUniprotBuilder.buildUniprotEntityInstanceFv(
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
                                        ));
                                        if (typeof config.onChangeCallback === "function")
                                            config.onChangeCallback({
                                                ...instance,
                                                upAcc
                                            });
                                    }
                                }
                            }),{addTitle:true});
                        }
                    }
                }
            })
        )
        return container;
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
                await RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(elementId, entryId, RcsbFvUniprotEntity, {
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