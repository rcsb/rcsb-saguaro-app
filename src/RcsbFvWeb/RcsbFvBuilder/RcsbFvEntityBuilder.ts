import {rcsbFvCtxManager} from "./RcsbFvContextManager";
import {TagDelimiter} from "../Utils/TagDelimiter";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {RcsbFvEntity} from "../RcsbFvModule/RcsbFvEntity";
import {FieldName, OperationType, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {buildUniprotEntityFv} from "../RcsbFvBuilder";
import {RcsbFvAdditionalConfig} from "../RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {RcsbFv} from "@rcsb/rcsb-saguaro";
import {RcsbFvUniprotBuilder} from "./RcsbFvUniprotBuilder";

export class RcsbFvEntityBuilder {

    static async buildEntitySummaryFv(elementFvId: string, elementSelectId:string, entityId:string): Promise<void> {
        const rcsbFvSingleViewer: RcsbFv = RcsbFvCoreBuilder.buildRcsbFvSingleViewer(elementFvId);
        const pdbId:string = entityId.split(TagDelimiter.entity)[0];
        const buildSelectAndFv: (p: PolymerEntityInstanceTranslate)=>Promise<void> = (p: PolymerEntityInstanceTranslate)=>{
            return new Promise<void>(async (resolve, reject)=>{
                const rcsbFvEntity: RcsbFvEntity = new RcsbFvEntity(elementFvId, rcsbFvSingleViewer);
                rcsbFvEntity.setPolymerEntityInstanceTranslator(p);
                rcsbFvEntity.build({entityId:entityId,additionalConfig:{
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
                resolve();
            });
        };
        const entryId:string = entityId.split(TagDelimiter.entity)[0];
        await RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(entryId,buildSelectAndFv);
        return void 0;
    }

    static async buildSingleEntitySummaryFv(elementId: string, entityId: string): Promise<void> {
        return new Promise<void>((resolve,reject)=> {
            const buildFv: (p: PolymerEntityInstanceTranslate) => void = RcsbFvCoreBuilder.createFvBuilder(elementId, RcsbFvEntity, {
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

     static async buildEntityFv(elementId: string, entityId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<void> {
        return new Promise<null>((resolve,reject)=> {
            try {
                const buildFv: (p: PolymerEntityInstanceTranslate) => void = RcsbFvCoreBuilder.createFvBuilder(elementId, RcsbFvEntity, {
                    entityId: entityId,
                    additionalConfig: additionalConfig,
                    resolve: resolve
                });
                const entryId: string = entityId.split(TagDelimiter.entity)[0];
                RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(entryId, buildFv);
            }catch (e) {
                reject(e);
            }
        });
    }

}