import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {rcsbFvCtxManager} from "./RcsbFvContextManager";
import {EntryAssembliesCollector} from "../CollectTools/EntryAssembliesCollector";
import {InstanceSequenceOnchangeInterface, RcsbFvInstanceBuilder} from "./RcsbFvInstanceBuilder";

export class RcsbFvAssemblyBuilder {

    static buildAssemblySequenceFv(elementFvId:string, elementSelectAssemblyId:string, elementSelectInstanceId:string, entryId: string, onAsseblyChangeCallback?:(x: string)=>void, onInstanceChangeCallback?:(x: InstanceSequenceOnchangeInterface)=>void): Promise<void> {
        const assemblyCollector: EntryAssembliesCollector = new EntryAssembliesCollector();
        return assemblyCollector.collect({entry_id:entryId}).then(result=>{
            if(result.size == 0){
                RcsbFvCoreBuilder.showMessage(elementFvId, "No sequence features are available");
            }else{
                rcsbFvCtxManager.setEntityToInstance(entryId, new PolymerEntityInstanceTranslate(result.get(EntryAssembliesCollector.modelKey)));
                rcsbFvCtxManager.setButton(elementFvId, elementSelectAssemblyId);
                RcsbFvCoreBuilder.buildSelectButton(elementFvId, elementSelectAssemblyId, Array.from(result.keys()).map(assemblyId=>{
                    return {
                        name: assemblyId,
                        label: assemblyId,
                        onChange:()=>{
                            RcsbFvInstanceBuilder.buildSelectorInstanceFv(result.get(assemblyId), elementFvId, elementSelectInstanceId, entryId, {onChangeCallback: onInstanceChangeCallback});
                            if(typeof onAsseblyChangeCallback === "function")
                                onAsseblyChangeCallback(assemblyId);
                        }
                    }
                }), {dropdownTitle:"ASSEMBLY"});
                const out:Promise<void> = RcsbFvInstanceBuilder.buildSelectorInstanceFv(result.get(EntryAssembliesCollector.modelKey), elementFvId, elementSelectInstanceId, entryId, {onChangeCallback: onInstanceChangeCallback});
                if(typeof onAsseblyChangeCallback === "function")
                    onAsseblyChangeCallback(EntryAssembliesCollector.modelKey);
                return out;
            }
        }).catch(error=>{
            console.error(error);
            throw error;
        });
    }



}