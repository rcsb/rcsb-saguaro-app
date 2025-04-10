import {PolymerEntityInstanceTranslate} from "../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {RcsbFvEntity} from "../RcsbFvModule/RcsbFvEntity";
import {FieldName, AnnotationFilterInput, OperationType, AnnotationReference, FeaturesType} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAdditionalConfig} from "../RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvUniprotBuilder} from "./RcsbFvUniprotBuilder";
import {TagDelimiter} from "@rcsb/rcsb-api-tools/lib/RcsbUtils/TagDelimiter";

export class RcsbFvEntityBuilder {

    static async buildEntitySummaryFv(elementFvId: string, elementSelectId:string, entityId:string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface> {

        return new Promise<RcsbFvModulePublicInterface>((resolve, reject)=>{
            const pdbId:string = TagDelimiter.parseEntity(entityId).entryId;
            const createSelectAndFvBuilder: (p: PolymerEntityInstanceTranslate)=>Promise<RcsbFvModulePublicInterface> = async (p: PolymerEntityInstanceTranslate)=>{
                const rcsbFvEntity: RcsbFvModulePublicInterface = await RcsbFvCoreBuilder.createFv({
                    elementId: elementFvId,
                    fvModuleI: RcsbFvEntity,
                    p:p,
                    config: {
                        entityId: entityId,
                        elementSelectId: elementSelectId,
                        additionalConfig:{
                            rcsbContext:TagDelimiter.parseEntity(entityId),
                            ...customAdditionalConfig(),
                            ...additionalConfig
                        },
                        resolve:resolve
                    }
                });
                const targets = await rcsbFvEntity.getTargets();
                RcsbFvCoreBuilder.buildSelectButton(elementFvId, elementSelectId, [entityId].concat(targets).map(t => {
                    return {
                        label: t,
                        onChange: async () => {
                            if (t === entityId) {
                                await RcsbFvEntityBuilder.buildSingleEntitySummaryFv(elementFvId, entityId);
                            } else {
                                await RcsbFvUniprotBuilder.buildUniprotEntityFv(elementFvId, t, entityId, {
                                        alignmentFilter: [entityId],
                                        ...customAdditionalConfig({
                                            field:FieldName.TargetId,
                                            operation:OperationType.Contains,
                                            source:AnnotationReference.PdbInstance,
                                            values:[pdbId+TagDelimiter.instance]
                                        })
                                    }
                                );
                            }
                        }
                    }
                }))
                return rcsbFvEntity;
            };
            const entryId:string = TagDelimiter.parseEntity(entityId).entryId;
            RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndCustomBuildFv(entryId,createSelectAndFvBuilder);
        });
    }

    static async buildSingleEntitySummaryFv(elementId: string, entityId: string): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>((resolve,reject)=> {
            const entryId: string = TagDelimiter.parseEntity(entityId).entryId;
            RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(elementId, entryId, RcsbFvEntity, {
                entityId: entityId,
                additionalConfig: {
                    rcsbContext:TagDelimiter.parseEntity(entityId),
                    ...customAdditionalConfig()
                },
                resolve:resolve
            });
        });
    }

     static async buildEntityFv(elementId: string, entityId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface> {
         return new Promise<RcsbFvModulePublicInterface>((resolve,reject)=> {
             const entryId: string = TagDelimiter.parseEntity(entityId).entryId;
             RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(elementId, entryId, RcsbFvEntity, {
                 entityId: entityId,
                 additionalConfig: {
                     rcsbContext:TagDelimiter.parseEntity(entityId),
                     ...additionalConfig
                 },
                 resolve: resolve
             });
         });
    }

}

function customAdditionalConfig(f?: AnnotationFilterInput): RcsbFvAdditionalConfig{
    const filters: Array<AnnotationFilterInput> = [{
        field: FieldName.Type,
        operation: OperationType.Equals,
        source: AnnotationReference.PdbInstance,
        values: [FeaturesType.UnobservedResidueXyz,FeaturesType.UnobservedAtomXyz,FeaturesType.MaQaMetricLocalTypeOther,FeaturesType.MaQaMetricLocalTypePlddt]
    }];
    if(f) filters.push(f);
    return {
        sources:[AnnotationReference.PdbEntity,AnnotationReference.PdbInstance],
        filters:filters
    };
}