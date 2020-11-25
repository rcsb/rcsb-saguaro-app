import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {WebToolsManager} from "../WebTools/WebToolsManager";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {rcsbFvCtxManager} from "./RcsbFvContextManager";
import {EntryAssembliesCollector} from "../CollectTools/EntryAssembliesCollector";
import {InstanceSequenceOnchangeInterface, RcsbFvInstanceBuilder} from "./RcsbFvInstanceBuilder";

export class RcsbFvAssemblyBuilder {

    static buildAssemblySequenceFv(elementFvId:string, elementSelectAssemblyId:string, elementSelectInstanceId:string, entryId: string, onAsseblyChangeCallback?:(x: string)=>void, onInstanceChangeCallback?:(x: InstanceSequenceOnchangeInterface)=>void): void {
        const assemblyCollector: EntryAssembliesCollector = new EntryAssembliesCollector();
        assemblyCollector.collect({entry_id:entryId}).then(result=>{
            if(result.size == 0){
                RcsbFvCoreBuilder.showMessage(elementFvId, "No sequence features are available");
            }else{
                rcsbFvCtxManager.setEntityToInstance(entryId, new PolymerEntityInstanceTranslate(result.get(EntryAssembliesCollector.modelKey)));
                WebToolsManager.buildSelectButton(elementSelectAssemblyId, Array.from(result.keys()).map(assemblyId=>{
                    return {
                        name: assemblyId,
                        label: assemblyId,
                        onChange:()=>{
                            WebToolsManager.clearSelectButton(elementSelectInstanceId);
                            RcsbFvInstanceBuilder.buildSelectorInstanceFv(result.get(assemblyId), elementFvId, elementSelectInstanceId, entryId, undefined, onInstanceChangeCallback);
                            if(typeof onAsseblyChangeCallback === "function")
                                onAsseblyChangeCallback(assemblyId);
                        }
                    }
                }));
                RcsbFvInstanceBuilder.buildSelectorInstanceFv(result.get(EntryAssembliesCollector.modelKey), elementFvId, elementSelectInstanceId, entryId, undefined, onInstanceChangeCallback);
                if(typeof onAsseblyChangeCallback === "function")
                    onAsseblyChangeCallback(EntryAssembliesCollector.modelKey);
            }
        }).catch(error=>{
            console.error(error);
            throw error;
        });
    }



}