import {TagDelimiter} from "../Utils/TagDelimiter";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {RcsbFvEntity} from "../RcsbFvModule/RcsbFvEntity";
import {FieldName, FilterInput, OperationType, Source, Type} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAdditionalConfig} from "../RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvUniprotBuilder} from "./RcsbFvUniprotBuilder";

export class RcsbFvEntityBuilder {

    static async buildEntitySummaryFv(elementFvId: string, elementSelectId:string, entityId:string): Promise<RcsbFvModulePublicInterface> {

        return new Promise<RcsbFvModulePublicInterface>((resolve, reject)=>{
            const pdbId:string = entityId.split(TagDelimiter.entity)[0];
            const createSelectAndFvBuilder: (p: PolymerEntityInstanceTranslate)=>Promise<RcsbFvModulePublicInterface> = async (p: PolymerEntityInstanceTranslate)=>{
                const rcsbFvEntity: RcsbFvModulePublicInterface = await RcsbFvCoreBuilder.createFv({
                    elementId: elementFvId,
                    fvModuleI: RcsbFvEntity,
                    p:p,
                    config: {
                        entityId: entityId,
                        elementSelectId: elementSelectId,
                        additionalConfig:additionalConfig(),
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
                                await RcsbFvUniprotBuilder.buildUniprotEntityFv(elementFvId, t, entityId, additionalConfig({
                                        field:FieldName.TargetId,
                                        operation:OperationType.Contains,
                                        source:Source.PdbInstance,
                                        values:[pdbId]
                                    })
                                );
                            }
                        }
                    }
                }))
                return rcsbFvEntity;
            };
            const entryId:string = entityId.split(TagDelimiter.entity)[0];
            RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndCustomBuildFv(entryId,createSelectAndFvBuilder);
        });
    }

    static async buildSingleEntitySummaryFv(elementId: string, entityId: string): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>((resolve,reject)=> {
            const entryId: string = entityId.split(TagDelimiter.entity)[0];
            RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(elementId, entryId, RcsbFvEntity, {
                entityId: entityId,
                additionalConfig: additionalConfig(),
                resolve:resolve
            });
        });
    }

     static async buildEntityFv(elementId: string, entityId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface> {
         return new Promise<RcsbFvModulePublicInterface>((resolve,reject)=> {
             const entryId: string = entityId.split(TagDelimiter.entity)[0];
             RcsbFvCoreBuilder.getPolymerEntityInstanceMapAndBuildFv(elementId, entryId, RcsbFvEntity, {
                 entityId: entityId,
                 additionalConfig: additionalConfig,
                 resolve: resolve
             });
         });
    }

}

function additionalConfig(f?: FilterInput): RcsbFvAdditionalConfig{
    const filters: Array<FilterInput> = [{
        field: FieldName.Type,
        operation:OperationType.Equals,
        source:Source.PdbInstance,
        values:[Type.UnobservedResidueXyz,Type.UnobservedAtomXyz]
    }];
    if(f) filters.push(f);
    return {
        sources:[Source.PdbEntity,Source.PdbInstance],
        filters:filters
    };
}