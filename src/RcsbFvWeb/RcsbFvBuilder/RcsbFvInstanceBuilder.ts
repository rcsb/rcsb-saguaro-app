import {
    RcsbContextType,
    RcsbFvAdditionalConfig,
    RcsbFvModuleContainerPublicInterface
} from "../RcsbFvModule/RcsbFvModuleInterface";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {RcsbFvInstance} from "../RcsbFvModule/RcsbFvInstance";
import {TagDelimiter} from "../../RcsbUtils/Helpers/TagDelimiter";
import {PolymerEntityInstanceInterface} from "../../RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {
    SelectOptionInterface,
    SelectOptionProps
} from "../WebTools/SelectButton";
import {RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvInterface} from "../RcsbFvModule/RcsbFvInterface";
import {rcsbRequestCtxManager} from "../../RcsbRequest/RcsbRequestContextManager";
import {DataContainer} from "../../RcsbUtils/Helpers/DataContainer";

type instanceModule = "interface"|"instance";
export interface InstanceSequenceConfig {
    dropdownTitle?: string;
    defaultValue?: string|undefined|null;
    beforeChangeCallback?:(x: PolymerEntityInstanceInterface)=>undefined|RcsbContextType;
    onChangeCallback?:(x: PolymerEntityInstanceInterface)=>void;
    filterInstances?: Set<string>;
    displayAuthId?: boolean;
    selectButtonOptionProps?: (props: SelectOptionProps)=>JSX.Element;
    module?: instanceModule;
}

//TODO Find a better structure for change callbacks
export class RcsbFvInstanceBuilder {

    static async buildMultipleInstanceSequenceFv(elementFvId:string, elementEntrySelectId:string, elementInstanceSelectId:string, entryIdList: Array<string>, config: InstanceSequenceConfig={}, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModuleContainerPublicInterface> {
        RcsbFvCoreBuilder.buildSelectButton(elementFvId, elementEntrySelectId, entryIdList.map(entryId=>{
            return {
                label:entryId,
                shortLabel:entryId,
                onChange: async ()=>{
                    await RcsbFvInstanceBuilder.buildInstanceSequenceFv(elementFvId, elementInstanceSelectId, entryId, {...config, displayAuthId: true}, additionalConfig, container);
                }
            }
        }),{addTitle:true, dropdownTitle:"PDB"});
        const entryId: string = entryIdList[0];
        const container: DataContainer<Promise<RcsbFvModulePublicInterface>> = new DataContainer<Promise<RcsbFvModulePublicInterface>>();
        await RcsbFvInstanceBuilder.buildInstanceSequenceFv(elementFvId, elementInstanceSelectId, entryId, {...config, displayAuthId: true}, additionalConfig, container);
        return container;
    }

    static async buildInstanceSequenceFv(elementFvId:string, elementSelectId:string, entryId: string, config: InstanceSequenceConfig, additionalConfig?:RcsbFvAdditionalConfig, externalContainer?: DataContainer<Promise<RcsbFvModulePublicInterface>>): Promise<RcsbFvModuleContainerPublicInterface> {
        const entityInstanceTranslator: PolymerEntityInstanceTranslate = await rcsbRequestCtxManager.getEntityToInstance(entryId);
        const result: Array<PolymerEntityInstanceInterface> = entityInstanceTranslator.getData();
        if(result.length == 0){
            RcsbFvCoreBuilder.showMessage(elementFvId, "No sequence features are available");
            return void 0;
        }else{
            return RcsbFvInstanceBuilder.buildSelectorInstanceFv(result, elementFvId, elementSelectId, entryId, config, additionalConfig,externalContainer);
        }
    }

    static async buildSelectorInstanceFv(instanceList: Array<PolymerEntityInstanceInterface>, elementFvId:string, elementSelectId:string, entryId: string, config: InstanceSequenceConfig, additionalConfig?:RcsbFvAdditionalConfig, externalContainer?: DataContainer<Promise<RcsbFvModulePublicInterface>>): Promise<RcsbFvModuleContainerPublicInterface>{
        const filteredInstanceList: Array<PolymerEntityInstanceInterface> = instanceList.filter(i=>(config.filterInstances == null || config.filterInstances.has(i.asymId)));
        const groupedInstances: Map<string, Array<SelectOptionInterface>> = new Map<string, Array<SelectOptionInterface>>();
        filteredInstanceList.forEach((instance)=>{
            if(!groupedInstances.has(instance.entityId))
                groupedInstances.set(instance.entityId, new Array<SelectOptionInterface>());
            const label: string = instance.asymId === instance.authId ? instance.asymId : `${instance.asymId} [auth ${instance.authId}]`;
            groupedInstances.get(instance.entityId).push({
                name: instance.name + " - " + instance.taxNames.join(", "),
                label: label,
                groupLabel: `ENTITY ${instance.entityId} - ${instance.name}`,
                shortLabel: config.displayAuthId === true ? instance.authId : label,
                optId: instance.authId,
                onChange: async () => {
                    let externalContext: RcsbContextType | undefined;
                    if (typeof config.beforeChangeCallback === "function")
                        externalContext = config.beforeChangeCallback(instance);
                    const rcsbContext:RcsbContextType = {
                        ...additionalConfig?.rcsbContext,
                        ...externalContext,
                        ...instance
                    };
                    container.set(RcsbFvInstanceBuilder.buildInstanceFv(
                        elementFvId,
                        instance.rcsbId,
                        {...additionalConfig, rcsbContext: rcsbContext},
                        config.module
                    ));
                    if (typeof config.onChangeCallback === "function")
                        config.onChangeCallback(instance);
                }
            })
        });
        let index: number = 0;
        if (config.defaultValue != null) {
            const n: number = filteredInstanceList.findIndex(a => {
                return a.authId === config.defaultValue
            });
            if (n >= 0)
                index = n;
            else
                config.defaultValue = undefined
        }
        RcsbFvCoreBuilder.buildSelectButton(elementFvId, elementSelectId, Array.from(groupedInstances.values()).map(group=>({
            label: group[0].groupLabel,
            options: group
        })), {addTitle:true, defaultValue: config.defaultValue, dropdownTitle: (config.dropdownTitle ?? "INSTANCE"), width: config.displayAuthId === true ? 70 : undefined, optionProps: config.selectButtonOptionProps });
        let externalContext: RcsbContextType | undefined;
        if (typeof config.beforeChangeCallback === "function")
            externalContext = config.beforeChangeCallback(filteredInstanceList[index]);
        const rcsbContext:RcsbContextType = {
            ...additionalConfig?.rcsbContext,
            ...externalContext,
            ...filteredInstanceList[index]
        };
        const module: Promise<RcsbFvModulePublicInterface> = RcsbFvInstanceBuilder.buildInstanceFv(elementFvId, filteredInstanceList[index].rcsbId, {...additionalConfig, rcsbContext: rcsbContext}, config.module);
        if (typeof config.onChangeCallback === "function")
            config.onChangeCallback(filteredInstanceList[index]);
        const container: DataContainer<Promise<RcsbFvModulePublicInterface>> = externalContainer ?? new DataContainer<Promise<RcsbFvModulePublicInterface>>();
        container.set(module);
        return container
    }

    static async buildInstanceFv(elementId:string, instanceId:string, additionalConfig?:RcsbFvAdditionalConfig, module?:instanceModule): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>((resolve,reject)=>{
            try {
                const entryId: string = instanceId.split(TagDelimiter.instance)[0];
                const asymId: string = instanceId.split(TagDelimiter.instance)[1];
                RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(elementId, entryId, module === "interface" ? RcsbFvInterface : RcsbFvInstance, {
                    instanceId: instanceId,
                    additionalConfig: {
                        ...additionalConfig,
                        rcsbContext: {
                            ...additionalConfig?.rcsbContext,
                            entryId: entryId,
                            asymId: asymId
                        }
                    },
                    resolve: resolve
                });
            }catch (e) {
                reject(e);
            }
        });
    }

}