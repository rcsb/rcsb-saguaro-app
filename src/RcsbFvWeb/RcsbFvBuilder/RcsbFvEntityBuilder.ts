import {rcsbFvCtxManager} from "./RcsbFvContextManager";
import {TagDelimiter} from "../Utils/TagDelimiter";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {RcsbFvEntity} from "../RcsbFvModule/RcsbFvEntity";
import {FieldName, OperationType, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {buildUniprotEntityFv} from "../RcsbFvBuilder";
import {RcsbFvAdditionalConfig} from "../RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {RcsbFv} from "@rcsb/rcsb-saguaro";

export class RcsbFvEntityBuilder {

    static buildEntitySummaryFv(elementFvId: string, elementSelectId:string, entityId:string): Promise<void> {
        const rcsbFvSingleViewer: RcsbFv = RcsbFvCoreBuilder.buildRcsbFvSingleViewer(elementFvId);
        const pdbId:string = entityId.split(TagDelimiter.entity)[0];
        const buildSelectAndFv: (p: PolymerEntityInstanceTranslate)=>Promise<void> = (p: PolymerEntityInstanceTranslate)=>{
            return new Promise<void>((resolve, reject)=>{
                const rcsbFvEntity: RcsbFvEntity = new RcsbFvEntity(elementFvId, rcsbFvSingleViewer);
                rcsbFvEntity.setPolymerEntityInstance(p);
                rcsbFvEntity.build({entityId:entityId,additionalConfig:{
                        sources:[Source.PdbEntity,Source.PdbInstance],
                        filters:[{
                            field: FieldName.Type,
                            operation:OperationType.Equals,
                            source:Source.PdbInstance,
                            values:["UNOBSERVED_RESIDUE_XYZ","UNOBSERVED_ATOM_XYZ"]
                        }]}});
                rcsbFvCtxManager.setFv(elementFvId, rcsbFvSingleViewer);
                rcsbFvEntity.getTargets().then(targets => {
                    RcsbFvCoreBuilder.buildSelectButton(elementFvId, elementSelectId, [entityId].concat(targets).map(t => {
                        return {
                            label: t,
                            onChange: () => {
                                if (t === entityId) {
                                    RcsbFvEntityBuilder.buildSingleEntitySummaryFv(elementFvId, entityId);
                                } else {
                                    buildUniprotEntityFv(elementFvId, t, entityId, {
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
            });
        };
        const entryId:string = entityId.split(TagDelimiter.entity)[0];
        return RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(entryId,buildSelectAndFv);
    }

    static buildSingleEntitySummaryFv(elementId: string, entityId: string): Promise<null> {
        return new Promise<null>((resolve,reject)=> {
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

     static buildEntityFv(elementId: string, entityId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<null> {
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