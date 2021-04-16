import {
    FieldName, FilterInput, OperationType,
    SequenceReference,
    Source
} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvCore} from "./RcsbFvCore";
import {RcsbFvModuleInterface, RcsbFvModuleAdditionalConfig, RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";

export class RcsbFvUniprotEntity extends RcsbFvCore implements RcsbFvModuleInterface{

    public build(buildConfig: RcsbFvModuleBuildInterface): void {
        const upAcc: string = buildConfig.upAcc;
        const entityId: string = buildConfig.entityId;
        const additionalConfig:RcsbFvModuleAdditionalConfig = buildConfig.additionalConfig

        const filters:Array<FilterInput> = [{
            field:FieldName.TargetId,
            operation:OperationType.Equals,
            source: Source.PdbEntity,
            values:[entityId]
        }];

        this.sequenceCollector.collect({
            queryId: upAcc,
            from: SequenceReference.Uniprot,
            to: SequenceReference.PdbEntity,
            filterByTargetContains: entityId,
            excludeAlignmentLinks: true
        }).then(seqResult=>{
            this.annotationCollector.collect({
                queryId: upAcc,
                reference: SequenceReference.Uniprot,
                sources:additionalConfig?.sources ? additionalConfig.sources : [Source.PdbEntity, Source.Uniprot],
                addTargetInTitle:new Set([Source.PdbInstance]),
                filters:additionalConfig?.filters instanceof Array ? additionalConfig.filters.concat(filters) : filters
            }).then(annResult=>{
                this.boardConfigData.length = this.sequenceCollector.getLength();
                this.boardConfigData.includeAxis = true;
                this.rowConfigData = seqResult.sequence.concat(seqResult.alignment).concat(annResult);
                this.display();
                if(buildConfig.resolve!=null)buildConfig.resolve(this);
            }).catch(error=>{
                console.error(error);
            });
        }).catch(error=>{
            console.error(error);
        });
    }

}