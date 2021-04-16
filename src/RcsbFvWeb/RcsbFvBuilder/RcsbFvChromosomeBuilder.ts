import {EntryInstancesCollector} from "../CollectTools/EntryInstancesCollector";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {Constants} from "../Utils/Constants";
import {GenomeEntityTranslate} from "../Utils/GenomeEntityTranslate";
import {RcsbFvChromosome} from "../RcsbFvModule/RcsbFvChromosome";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {rcsbFvCtxManager} from "./RcsbFvContextManager";
import {RcsbFv} from "@rcsb/rcsb-saguaro";
import {RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";

export class RcsbFvChromosomeBuilder {

    static buildFullChromosome(elementFvId:string, chrId: string): Promise<RcsbFvModulePublicInterface>{
        return RcsbFvChromosomeBuilder.buildChromosome(elementFvId, null, chrId);
    }

    static buildEntryChromosome(elementFvId:string, entitySelectId:string, chromosomeSelectId:string, entryId: string): Promise<RcsbFvModulePublicInterface>{
        return new Promise<RcsbFvModulePublicInterface>((resolve, reject)=>{
            rcsbFvCtxManager.setBoardConfig({rowTitleWidth:160});
            const instanceCollector: EntryInstancesCollector = new EntryInstancesCollector();
            instanceCollector.collect({entry_id:entryId}).then(result=> {
                rcsbFvCtxManager.setEntityToInstance(entryId, new PolymerEntityInstanceTranslate(result));
                const entitySet: Set<string> = new Set<string>();
                result.sort((a,b)=>{
                    return parseInt(a.entityId)-parseInt(b.entityId);
                }).forEach(r=>{
                    entitySet.add(r.entryId+Constants.entity+r.entityId);
                });
                const entityGenomeTranslate: GenomeEntityTranslate = new GenomeEntityTranslate(Array.from(entitySet));
                entityGenomeTranslate.getChrMap().then(entityMap=>{
                    if(entityMap.size == 0){
                        RcsbFvCoreBuilder.showMessage(elementFvId, "No genome alignments are available");
                    }else{
                        const unique: Set<string> = new Set<string>();
                        RcsbFvCoreBuilder.buildSelectButton(elementFvId, entitySelectId,result.filter(r=>{
                            const included: boolean = unique.has(r.entryId+Constants.entity+r.entityId);
                            unique.add(r.entryId+Constants.entity+r.entityId);
                            return entityMap.has(r.entryId+Constants.entity+r.entityId) && !included;
                        }).map((e,n)=>{
                            const entityId: string = e.entryId+Constants.entity+e.entityId;
                            if(n == 0) {
                                RcsbFvChromosomeBuilder.buildEntityChromosome(elementFvId, chromosomeSelectId, entityId).then((rcsbFvModule)=>{
                                    resolve(rcsbFvModule);
                                });
                            }
                            return{
                                name: e.names + " - " + e.taxIds.join(", "),
                                label: entityId + " - " + e.names,
                                shortLabel: entityId,
                                onChange:()=>{
                                    RcsbFvChromosomeBuilder.buildEntityChromosome(elementFvId,chromosomeSelectId,entityId);
                                }
                            }
                        }), {addTitle:true, dropdownTitle:"ENTITY"});
                    }
                });
            });
        });

    }

    static buildEntityChromosome(elementFvId:string,elementSelectId:string,  entityId: string): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>((resolve, reject)=>{
            const rcsbFvSingleViewer: RcsbFv = rcsbFvCtxManager.getFv(elementFvId) ?? RcsbFvCoreBuilder.buildRcsbFvSingleViewer(elementFvId);
            if (rcsbFvCtxManager.getFv(elementFvId) == null ){
                rcsbFvCtxManager.setFv(elementFvId, rcsbFvSingleViewer);
            }
            const chrViewer: RcsbFvChromosome = new RcsbFvChromosome(elementFvId,rcsbFvSingleViewer);
            chrViewer.build({entityId: entityId, elementSelectId: elementSelectId});
            chrViewer.getTargets().then(targets=>{
                RcsbFvCoreBuilder.buildSelectButton(elementFvId, elementSelectId, targets.map((chrId,n)=>{
                    return {
                        label: chrId,
                        name: chrId,
                        shortLabel: chrId,
                        onChange:()=>{
                            RcsbFvChromosomeBuilder.buildChromosome(elementFvId, entityId, chrId, elementSelectId);
                        }
                    };
                }),{addTitle: false, width:190, dropdownTitle: "CHROMOSOME"});
                resolve(chrViewer);
            });
        });
    }

    static buildChromosome(elementFvId:string, entityId: string, chrId: string, elementSelectId?: string): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>((resolve,reject)=> {
            try {
                RcsbFvCoreBuilder.createFv({
                    elementId: elementFvId,
                    fvModuleI: RcsbFvChromosome,
                    config: {
                        entityId: entityId,
                        chrId: chrId,
                        elementSelectId: elementSelectId,
                        resolve: resolve
                    }
                });
            }catch(e) {
                reject(e);
            }
        });
    }
}