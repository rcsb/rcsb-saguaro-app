import {PolymerEntityInstanceInterface} from "../../RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";
import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {TagDelimiter} from "../../RcsbUtils/Helpers/TagDelimiter";
import {PolymerEntityChromosomeTranslate} from "../../RcsbUtils/Translators/PolymerEntityChromosomeTranslate";
import {RcsbFvChromosome} from "../RcsbFvModule/RcsbFvChromosome";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {
    RcsbFvAdditionalConfig,
    RcsbFvModulePublicInterface
} from "../RcsbFvModule/RcsbFvModuleInterface";
import {rcsbRequestCtxManager} from "../../RcsbRequest/RcsbRequestContextManager";

export class RcsbFvChromosomeBuilder {

    static async buildFullChromosome(elementFvId:string, chrId: string): Promise<RcsbFvModulePublicInterface>{
        return await RcsbFvChromosomeBuilder.buildChromosome(elementFvId, null, chrId);
    }

    static async buildEntryChromosome(elementFvId:string, entitySelectId:string, chromosomeSelectId:string, entryId: string): Promise<RcsbFvModulePublicInterface>{
        return new Promise<RcsbFvModulePublicInterface>(async (resolve, reject)=>{
            const entityInstanceTranslator: PolymerEntityInstanceTranslate = await rcsbRequestCtxManager.getEntityToInstance(entryId);
            const result:PolymerEntityInstanceInterface[] = entityInstanceTranslator.getData();
            const entitySet: Set<string> = new Set<string>();
            result.sort((a,b)=>{
                return parseInt(a.entityId)-parseInt(b.entityId);
            }).forEach(r=>{
                entitySet.add(r.entryId+TagDelimiter.entity+r.entityId);
            });
            const entityChrTranslate: PolymerEntityChromosomeTranslate = await rcsbRequestCtxManager.getEntityToChromosome(Array.from(entitySet));
            const entityMap: Map<string, string[]> = entityChrTranslate.getData();
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
                            name: e.name + " - " + e.taxNames.join(", "),
                            label: entityId + " - " + e.name,
                            shortLabel: entityId,
                            onChange:async ()=>{
                                await RcsbFvChromosomeBuilder.buildEntityChromosome(elementFvId,chromosomeSelectId,entityId);
                            }
                        }
                    }), {addTitle:true, dropdownTitle:"ENTITY"}
                );
            }
        });
    }

    static async buildEntityChromosome(elementFvId:string,elementSelectId:string,  entityId: string): Promise<RcsbFvModulePublicInterface> {
        const chrViewer: RcsbFvModulePublicInterface = await RcsbFvChromosomeBuilder.buildChromosome(elementFvId, entityId, null, elementSelectId,{boardConfig:{rowTitleWidth:160}});
        const targets: string[] = await chrViewer.getTargets();
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
        return chrViewer;
    }

    static async buildChromosome(elementFvId:string, entityId: string, chrId: string, elementSelectId?: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>((resolve,reject)=> {
            try {
                RcsbFvCoreBuilder.createFv({
                    elementId: elementFvId,
                    fvModuleI: RcsbFvChromosome,
                    config: {
                        entityId: entityId,
                        chrId: chrId,
                        elementSelectId: elementSelectId,
                        additionalConfig:{
                            rcsbContext:{
                                ...TagDelimiter.parseEntity(entityId),
                                chrId: chrId
                            },
                            ...additionalConfig
                        },
                        resolve:resolve
                    }
                });
            }catch(e) {
                reject(e);
            }
        });
    }
}