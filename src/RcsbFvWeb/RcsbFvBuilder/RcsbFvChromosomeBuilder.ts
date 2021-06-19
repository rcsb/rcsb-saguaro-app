import {EntryInstancesCollector} from "../CollectTools/EntryInstancesCollector";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {TagDelimiter} from "../Utils/TagDelimiter";
import {GenomeEntityTranslate} from "../Utils/GenomeEntityTranslate";
import {WebToolsManager} from "../WebTools/WebToolsManager";
import {RcsbFvChromosome} from "../RcsbFvModule/RcsbFvChromosome";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {rcsbFvCtxManager} from "./RcsbFvContextManager";
import {RcsbFv} from "@rcsb/rcsb-saguaro";
import {RcsbFvModuleInterface, RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";

export class RcsbFvChromosomeBuilder {

    static async buildFullChromosome(elementFvId:string, chrId: string): Promise<RcsbFvModulePublicInterface>{
        return await RcsbFvChromosomeBuilder.buildChromosome(elementFvId, null, chrId);
    }

    static async buildEntryChromosome(elementFvId:string, entitySelectId:string, chromosomeSelectId:string, entryId: string): Promise<RcsbFvModulePublicInterface>{
        return new Promise<RcsbFvModulePublicInterface>(async (resolve, reject)=>{
            rcsbFvCtxManager.setBoardConfig({rowTitleWidth:160});
            const instanceCollector: EntryInstancesCollector = new EntryInstancesCollector();
            const result = await instanceCollector.collect({entry_id:entryId});
            rcsbFvCtxManager.setEntityToInstance(entryId, new PolymerEntityInstanceTranslate(result));
            const entitySet: Set<string> = new Set<string>();
            result.sort((a,b)=>{
                return parseInt(a.entityId)-parseInt(b.entityId);
            }).forEach(r=>{
                entitySet.add(r.entryId+TagDelimiter.entity+r.entityId);
            });
            const entityGenomeTranslate: GenomeEntityTranslate = new GenomeEntityTranslate(Array.from(entitySet));
            const entityMap: Map<string, Array<string>> = await entityGenomeTranslate.getChrMap();
            if(entityMap.size == 0){
                RcsbFvCoreBuilder.showMessage(elementFvId, "No genome alignments are available");
            }else{
                const unique: Set<string> = new Set<string>();
                RcsbFvCoreBuilder.buildSelectButton(elementFvId, entitySelectId,result.filter(r=>{
                    const included: boolean = unique.has(r.entryId+TagDelimiter.entity+r.entityId);
                    unique.add(r.entryId+TagDelimiter.entity+r.entityId);
                    return entityMap.has(r.entryId+TagDelimiter.entity+r.entityId) && !included;
                }).map((e,n)=>{
                    const entityId: string = e.entryId+TagDelimiter.entity+e.entityId;
                    if(n == 0) {
                        RcsbFvChromosomeBuilder.buildEntityChromosome(elementFvId, chromosomeSelectId, entityId).then((module)=>{
                            resolve(module);
                        });
                    }
                    return{
                        name: e.names + " - " + e.taxIds.join(", "),
                        label: entityId + " - " + e.names,
                        shortLabel: entityId,
                        onChange:async ()=>{
                            await RcsbFvChromosomeBuilder.buildEntityChromosome(elementFvId,chromosomeSelectId,entityId);
                        }
                    }
                }), {addTitle:true, dropdownTitle:"ENTITY"});
            }
        });
    }

    static async buildEntityChromosome(elementFvId:string,elementSelectId:string,  entityId: string): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>(async (resolve, reject)=>{
            const rcsbFvSingleViewer: RcsbFv = rcsbFvCtxManager.getFv(elementFvId) ?? RcsbFvCoreBuilder.buildRcsbFvSingleViewer(elementFvId);
            if (rcsbFvCtxManager.getFv(elementFvId) == null ){
                rcsbFvCtxManager.setFv(elementFvId, rcsbFvSingleViewer);
            }
            const chrViewer: RcsbFvModuleInterface = new RcsbFvChromosome(elementFvId,rcsbFvSingleViewer);
            await chrViewer.build({entityId: entityId, elementSelectId: elementSelectId, resolve:resolve});
            const targets: Array<string>  = await chrViewer.getTargets();
            RcsbFvCoreBuilder.buildSelectButton(elementFvId, elementSelectId, targets.map((chrId,n)=>{
                return {
                    label: chrId,
                    name: chrId,
                    shortLabel: chrId,
                    onChange: async ()=>{
                        await RcsbFvChromosomeBuilder.buildChromosome(elementFvId, entityId, chrId, elementSelectId);
                    }
                };
            }),{addTitle: false, width:190, dropdownTitle: "CHROMOSOME"});
        });
    }

    static async buildChromosome(elementFvId:string, entityId: string, chrId: string, elementSelectId?: string): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>(async (resolve,reject)=> {
            try {
                await RcsbFvCoreBuilder.createFv({
                    elementId: elementFvId,
                    fvModuleI: RcsbFvChromosome,
                    config: {
                        entityId: entityId,
                        chrId: chrId,
                        elementSelectId: elementSelectId,
                        resolve:resolve
                    }
                });
            }catch(e) {
                reject(e);
            }
        });
    }
}