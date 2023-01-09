import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {InstanceSequenceOnchangeInterface, RcsbFvInstanceBuilder} from "./RcsbFvInstanceBuilder";
import {PolymerEntityInstanceInterface} from "../../RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";
import {RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {EntryAssemblyTranslate} from "../../RcsbUtils/Translators/EntryAssemblyTranslate";
import {rcsbRequestCtxManager} from "../../RcsbRequest/RcsbRequestContextManager";
import {Assertions} from "../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;

export class RcsbFvAssemblyBuilder {

    static async buildAssemblySequenceFv(elementFvId:string, elementSelectAssemblyId:string, elementSelectInstanceId:string, entryId: string, onAsseblyChangeCallback?:(x: string)=>void, onInstanceChangeCallback?:(x: InstanceSequenceOnchangeInterface)=>void): Promise<RcsbFvModulePublicInterface> {
        const assemblyTranslate: EntryAssemblyTranslate = await rcsbRequestCtxManager.getEntryToAssembly(entryId);
        const assemblyMap:Map<string,Array<PolymerEntityInstanceInterface>>  = assemblyTranslate.getData();
        if(assemblyMap.size == 0){
            RcsbFvCoreBuilder.showMessage(elementFvId, "No sequence features are available");
            throw new Error("No sequence features are available");
        }else{
            RcsbFvCoreBuilder.buildSelectButton(elementFvId, elementSelectAssemblyId, Array.from(assemblyMap.keys()).map(assemblyId=>{
                return {
                    name: assemblyId,
                    label: assemblyId,
                    onChange: async ()=>{
                        const o = assemblyMap.get(assemblyId);
                        if(!o)
                            return;
                        await RcsbFvInstanceBuilder.buildSelectorInstanceFv(o, elementFvId, elementSelectInstanceId, entryId, {onChangeCallback: onInstanceChangeCallback});
                        if(typeof onAsseblyChangeCallback === "function")
                            onAsseblyChangeCallback(assemblyId);
                    }
                }
            }), {dropdownTitle:"ASSEMBLY"});
            const o = assemblyMap.get(rcsbRequestCtxManager.modelKey);
            assertDefined(o);
            const out: RcsbFvModulePublicInterface = await RcsbFvInstanceBuilder.buildSelectorInstanceFv(o, elementFvId, elementSelectInstanceId, entryId, {onChangeCallback: onInstanceChangeCallback});
            if(typeof onAsseblyChangeCallback === "function")
                onAsseblyChangeCallback(rcsbRequestCtxManager.modelKey);
            return out;
        }
    }

}