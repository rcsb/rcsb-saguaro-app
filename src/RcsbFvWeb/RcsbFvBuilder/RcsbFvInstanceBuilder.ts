import {RcsbFvAdditionalConfig} from "../RcsbFvModule/RcsbFvModuleInterface";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {RcsbFvInstance} from "../RcsbFvModule/RcsbFvInstance";
import {TagDelimiter} from "../Utils/TagDelimiter";
import {EntryInstancesCollector} from "../CollectTools/EntryInstancesCollector";
import {WebToolsManager} from "../WebTools/WebToolsManager";
import {buildInstanceFv} from "../RcsbFvBuilder";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {rcsbFvCtxManager} from "./RcsbFvContextManager";

export interface InstanceSequenceOnchangeInterface {
    pdbId: string;
    authId: string;
    asymId: string;
}

export class RcsbFvInstanceBuilder {

    static buildInstanceSequenceFv(elementFvId:string, elementSelectId:string, entryId: string, defaultValue?: string|undefined|null, onChangeCallback?:(x: InstanceSequenceOnchangeInterface)=>void): void {
        const instanceCollector: EntryInstancesCollector = new EntryInstancesCollector();
        instanceCollector.collect({entry_id:entryId}).then(result=>{
            if(result.length == 0){
                RcsbFvCoreBuilder.showMessage(elementFvId, "No sequence features are available");
            }else{
                rcsbFvCtxManager.setEntityToInstance(entryId, new PolymerEntityInstanceTranslate(result));
                WebToolsManager.buildSelectButton(elementSelectId, result.map(instance => {
                    return {
                        name: instance.names + " - " + instance.taxIds.join(", "),
                        label: instance.entryId + TagDelimiter.instance + instance.authId + " - " + instance.names,
                        shortLabel: instance.entryId + TagDelimiter.instance + instance.authId,
                        onChange: () => {
                            buildInstanceFv(
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
                }), {addTitle:true, defaultValue: defaultValue});
                let index: number = 0;
                if (defaultValue != null) {
                    const n: number = result.findIndex(a => {
                        return a.authId === defaultValue.split(TagDelimiter.instance)[1] && a.entryId === defaultValue.split(TagDelimiter.instance)[0]
                    });
                    if (n >= 0) index = n;
                }
                buildInstanceFv(elementFvId, result[index].rcsbId).then(() => {
                    if (typeof onChangeCallback === "function")
                        onChangeCallback({
                            pdbId: result[index].entryId,
                            authId: result[index].authId,
                            asymId: result[index].asymId
                        });
                });
            }
        }).catch(error=>{
            console.error(error);
            throw error;
        });
    }

    static buildInstanceFv(elementId: string, instanceId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<null> {
        return new Promise<null>((resolve,reject)=>{
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