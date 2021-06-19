import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {rcsbFvCtxManager} from "./RcsbFvContextManager";
import {EntryAssembliesCollector} from "../CollectTools/EntryAssembliesCollector";
import {InstanceSequenceOnchangeInterface, RcsbFvInstanceBuilder} from "./RcsbFvInstanceBuilder";
import {PolymerEntityInstanceInterface} from "../CollectTools/EntryInstancesCollector";
import {RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";

export class RcsbFvAssemblyBuilder {

    static async buildAssemblySequenceFv(elementFvId:string, elementSelectAssemblyId:string, elementSelectInstanceId:string, entryId: string, onAsseblyChangeCallback?:(x: string)=>void, onInstanceChangeCallback?:(x: InstanceSequenceOnchangeInterface)=>void): Promise<RcsbFvModulePublicInterface> {
        const assemblyCollector: EntryAssembliesCollector = new EntryAssembliesCollector();
        const assemblyMap:Map<string,Array<PolymerEntityInstanceInterface>>  = await assemblyCollector.collect({entry_id:entryId});
        if(assemblyMap.size == 0){
            RcsbFvCoreBuilder.showMessage(elementFvId, "No sequence features are available");
        }else{
            rcsbFvCtxManager.setEntityToInstance(entryId, new PolymerEntityInstanceTranslate(assemblyMap.get(EntryAssembliesCollector.modelKey)));
            rcsbFvCtxManager.setButton(elementFvId, elementSelectAssemblyId);
            RcsbFvCoreBuilder.buildSelectButton(elementFvId, elementSelectAssemblyId, Array.from(assemblyMap.keys()).map(assemblyId=>{
                return {
                    name: assemblyId,
                    label: assemblyId,
                    onChange: async ()=>{
                        await RcsbFvInstanceBuilder.buildSelectorInstanceFv(assemblyMap.get(assemblyId), elementFvId, elementSelectInstanceId, entryId, {onChangeCallback: onInstanceChangeCallback});
                        if(typeof onAsseblyChangeCallback === "function")
                            onAsseblyChangeCallback(assemblyId);
                    }
                }
            }), {dropdownTitle:"ASSEMBLY"});
            const out: RcsbFvModulePublicInterface = await RcsbFvInstanceBuilder.buildSelectorInstanceFv(assemblyMap.get(EntryAssembliesCollector.modelKey), elementFvId, elementSelectInstanceId, entryId, {onChangeCallback: onInstanceChangeCallback});
            if(typeof onAsseblyChangeCallback === "function")
                onAsseblyChangeCallback(EntryAssembliesCollector.modelKey);
            return out;
        }
    }

}