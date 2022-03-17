import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {EntryAssembliesCollector} from "../../RcsbCollectTools/DataCollectors/EntryAssembliesCollector";
import {InstanceSequenceOnchangeInterface, RcsbFvInstanceBuilder} from "./RcsbFvInstanceBuilder";
import {PolymerEntityInstanceInterface} from "../../RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";
import {RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {EntryAssemblyTranslate} from "../../RcsbUtils/Translators/EntryAssemblyTranslate";
import {rcsbRequestCtxManager} from "../../RcsbRequest/RcsbRequestContextManager";

export class RcsbFvAssemblyBuilder {

    static async buildAssemblySequenceFv(elementFvId:string, elementSelectAssemblyId:string, elementSelectInstanceId:string, entryId: string, onAsseblyChangeCallback?:(x: string)=>void, onInstanceChangeCallback?:(x: InstanceSequenceOnchangeInterface)=>void): Promise<RcsbFvModulePublicInterface> {
        const assemblyTranslate: EntryAssemblyTranslate = await rcsbRequestCtxManager.getEntryToAssembly(entryId);
        const assemblyMap:Map<string,Array<PolymerEntityInstanceInterface>>  = assemblyTranslate.getData();
        if(assemblyMap.size == 0){
            RcsbFvCoreBuilder.showMessage(elementFvId, "No sequence features are available");
        }else{
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