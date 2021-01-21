import {RcsbFvAdditionalConfig} from "../RcsbFvModule/RcsbFvModuleInterface";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {RcsbFvInstance} from "../RcsbFvModule/RcsbFvInstance";
import {TagDelimiter} from "../Utils/TagDelimiter";
import {EntryInstancesCollector, PolymerEntityInstanceInterface} from "../CollectTools/EntryInstancesCollector";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {rcsbFvCtxManager} from "./RcsbFvContextManager";

export interface InstanceSequenceOnchangeInterface {
    pdbId: string;
    authId: string;
    asymId: string;
}

export class RcsbFvInstanceBuilder {

    static buildMultipleInstanceSequenceFv(elementFvId:string, elementEntrySelectId:string, elementInstanceSelectId:string, entryIdList: Array<string>, defaultValue?: Map<string, string|undefined|null>, onChangeCallback?:Map<string,(x: InstanceSequenceOnchangeInterface)=>void>, filterInstances?: Map<string,Set<string>>): Promise<void> {
        RcsbFvCoreBuilder.buildSelectButton(elementFvId, elementEntrySelectId, entryIdList.map(entryId=>{
            return {
                label:entryId,
                shortLabel:entryId,
                onChange:()=>{
                    RcsbFvInstanceBuilder.buildInstanceSequenceFv(elementFvId, elementInstanceSelectId, entryId, defaultValue?.get(entryId), onChangeCallback?.get(entryId), filterInstances?.get(entryId), true);
                }
            }
        }),{addTitle:true, dropdownTitle:"PDB"});
        const entryId: string = entryIdList[0];
        return RcsbFvInstanceBuilder.buildInstanceSequenceFv(elementFvId, elementInstanceSelectId, entryId, defaultValue?.get(entryId), onChangeCallback?.get(entryId), filterInstances?.get(entryId), true);
    }

    static buildInstanceSequenceFv(elementFvId:string, elementSelectId:string, entryId: string, defaultValue?: string|undefined|null, onChangeCallback?:(x: InstanceSequenceOnchangeInterface)=>void, filterInstances?: Set<string>, displayAuthId?: boolean): Promise<void> {
        const instanceCollector: EntryInstancesCollector = new EntryInstancesCollector();
        return instanceCollector.collect({entry_id:entryId}).then(result=>{
            if(result.length == 0){
                RcsbFvCoreBuilder.showMessage(elementFvId, "No sequence features are available");
            }else{
                rcsbFvCtxManager.setEntityToInstance(entryId, new PolymerEntityInstanceTranslate(result));
                return RcsbFvInstanceBuilder.buildSelectorInstanceFv(result, elementFvId, elementSelectId, entryId, defaultValue, onChangeCallback, filterInstances, displayAuthId);
            }
        }).catch(error=>{
            console.error(error);
            throw error;
        });
    }

    static buildSelectorInstanceFv(instanceList: Array<PolymerEntityInstanceInterface>, elementFvId:string, elementSelectId:string, entryId: string, defaultValue?: string|undefined|null, onChangeCallback?:(x: InstanceSequenceOnchangeInterface)=>void, filterInstances?: Set<string>, displayAuthId?: boolean): Promise<void>{
        const filteredInstanceList: Array<PolymerEntityInstanceInterface> = instanceList.filter(i=>(filterInstances == null || filterInstances.has(i.asymId)));
        RcsbFvCoreBuilder.buildSelectButton(elementFvId, elementSelectId, filteredInstanceList.map(instance => {
            return {
                name: instance.names + " - " + instance.taxIds.join(", "),
                label: instance.entryId + TagDelimiter.instance + instance.authId + " - " + instance.names,
                shortLabel: displayAuthId === true ? instance.authId : instance.entryId + TagDelimiter.instance + instance.authId,
                onChange: () => {
                    RcsbFvInstanceBuilder.buildInstanceFv(
                        elementFvId,
                        instance.rcsbId
                    ).then(() => {
                        if (typeof onChangeCallback === "function")
                            onChangeCallback({
                                pdbId: instance.entryId,
                                authId: instance.authId,
                                asymId: instance.asymId
                            });
                    });
                }
            }
        }), {addTitle:true, defaultValue: defaultValue, dropdownTitle:"INSTANCE", width: displayAuthId === true ? 70 : undefined });
        let index: number = 0;
        if (defaultValue != null) {
            const n: number = filteredInstanceList.findIndex(a => {
                return a.authId === defaultValue.split(TagDelimiter.instance)[1] && a.entryId === defaultValue.split(TagDelimiter.instance)[0]
            });
            if (n >= 0) index = n;
        }
        return RcsbFvInstanceBuilder.buildInstanceFv(elementFvId, filteredInstanceList[index].rcsbId).then(() => {
            if (typeof onChangeCallback === "function")
                onChangeCallback({
                    pdbId: filteredInstanceList[index].entryId,
                    authId: filteredInstanceList[index].authId,
                    asymId: filteredInstanceList[index].asymId
                });
        });
    }

    static buildInstanceFv(elementId: string, instanceId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<void> {
        return new Promise<void>((resolve,reject)=>{
            try {
                const buildFv: (p: PolymerEntityInstanceTranslate) => void = RcsbFvCoreBuilder.createFvBuilder(elementId, RcsbFvInstance, {
                    instanceId: instanceId,
                    additionalConfig: additionalConfig,
                    resolve: resolve
                });
                const entryId: string = instanceId.split(TagDelimiter.instance)[0];
                RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(entryId, buildFv);
            }catch (e) {
                reject(e);
            }
        });

    }

}