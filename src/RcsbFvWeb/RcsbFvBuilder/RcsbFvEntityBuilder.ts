import {rcsbFvCtxManager} from "./RcsbFvContextManager";
import {TagDelimiter} from "../Utils/TagDelimiter";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {RcsbFvEntity} from "../RcsbFvModule/RcsbFvEntity";
import {FieldName, OperationType, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAdditionalConfig, RcsbFvModuleInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {RcsbFv} from "@rcsb/rcsb-saguaro";
import {RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvUniprotBuilder} from "./RcsbFvUniprotBuilder";

export class RcsbFvEntityBuilder {

    static async buildEntitySummaryFv(elementFvId: string, elementSelectId:string, entityId:string): Promise<RcsbFvModulePublicInterface> {

        return new Promise<RcsbFvModulePublicInterface>((resolve, reject)=>{
            const rcsbFvSingleViewer: RcsbFv = RcsbFvCoreBuilder.buildRcsbFvSingleViewer(elementFvId);
            const pdbId:string = entityId.split(TagDelimiter.entity)[0];
            const buildSelectAndFv: (p: PolymerEntityInstanceTranslate)=>Promise<RcsbFvModulePublicInterface> = async (p: PolymerEntityInstanceTranslate)=>{
                const rcsbFvEntity: RcsbFvModuleInterface = new RcsbFvEntity(elementFvId, rcsbFvSingleViewer);
                rcsbFvEntity.setPolymerEntityInstanceTranslator(p);
                await rcsbFvEntity.build({entityId:entityId,resolve:resolve,additionalConfig:{
                        sources:[Source.PdbEntity,Source.PdbInstance],
                        filters:[{
                            field: FieldName.Type,
                            operation:OperationType.Equals,
                            source:Source.PdbInstance,
                            values:["UNOBSERVED_RESIDUE_XYZ","UNOBSERVED_ATOM_XYZ"]
                        }]}});
                rcsbFvCtxManager.setFv(elementFvId, rcsbFvSingleViewer);
                const targets = await rcsbFvEntity.getTargets();
                RcsbFvCoreBuilder.buildSelectButton(elementFvId, elementSelectId, [entityId].concat(targets).map(t => {
                    return {
                        label: t,
                        onChange: async () => {
                            if (t === entityId) {
                                await RcsbFvEntityBuilder.buildSingleEntitySummaryFv(elementFvId, entityId);
                            } else {
                                await RcsbFvUniprotBuilder.buildUniprotEntityFv(elementFvId, t, entityId, {
                                    sources:[Source.PdbEntity, Source.PdbInstance],
                                    filters:[{
                                        field:FieldName.TargetId,
                                        operation:OperationType.Contains,
                                        source:Source.PdbInstance,
                                        values:[pdbId]
                                    },{
                                        field: FieldName.Type,
                                        operation:OperationType.Equals,
                                        source:Source.PdbInstance,
                                        values:["UNOBSERVED_RESIDUE_XYZ","UNOBSERVED_ATOM_XYZ"]
                                    }]
                                });
                            }
                        }
                    }
                }))
                return rcsbFvEntity;
            };
            const entryId:string = entityId.split(TagDelimiter.entity)[0];
            RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(entryId,buildSelectAndFv);
        });
    }

    static async buildSingleEntitySummaryFv(elementId: string, entityId: string): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>((resolve,reject)=> {
            const buildFv: (p: PolymerEntityInstanceTranslate) => Promise<RcsbFvModulePublicInterface> = RcsbFvCoreBuilder.createFvBuilder(elementId, RcsbFvEntity, {
                entityId: entityId,
                additionalConfig: {
                    sources: [Source.PdbEntity, Source.PdbInstance],
                    filters: [{
                        field: FieldName.Type,
                        operation: OperationType.Equals,
                        source: Source.PdbInstance,
                        values: ["UNOBSERVED_RESIDUE_XYZ", "UNOBSERVED_ATOM_XYZ"]
                    }]
                },
                resolve:resolve
            });
            const entryId: string = entityId.split(TagDelimiter.entity)[0];
            RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(entryId, buildFv);
        });
    }

     static async buildEntityFv(elementId: string, entityId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface> {
         return new Promise<RcsbFvModulePublicInterface>((resolve,reject)=> {
             const buildFv: (p: PolymerEntityInstanceTranslate) => Promise<RcsbFvModulePublicInterface> = RcsbFvCoreBuilder.createFvBuilder(elementId, RcsbFvEntity, {
                 entityId: entityId,
                 additionalConfig: additionalConfig,
                 resolve: resolve
             });
             const entryId: string = entityId.split(TagDelimiter.entity)[0];
             RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(entryId, buildFv);
         });
    }

}