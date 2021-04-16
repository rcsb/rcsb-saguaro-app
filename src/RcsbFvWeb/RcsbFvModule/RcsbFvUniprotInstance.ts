import {
    FieldName,
    FilterInput,
    OperationType,
    SequenceReference,
    Source
} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvCore} from "./RcsbFvCore";
import {RcsbFvModuleInterface, RcsbFvModuleAdditionalConfig, RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";

export class RcsbFvUniprotInstance extends RcsbFvCore implements RcsbFvModuleInterface{

    public build(buildConfig: RcsbFvModuleBuildInterface): void {
        const upAcc: string = buildConfig.upAcc;
        const entityId:string = buildConfig.entityId;
        const instanceId: string = buildConfig.instanceId;
        const additionalConfig:RcsbFvModuleAdditionalConfig = buildConfig.additionalConfig;

        let sources: Array<Source> = [Source.Uniprot, Source.PdbEntity, Source.PdbInstance];
        if(additionalConfig != null && additionalConfig.sources!=null && additionalConfig.sources.length>0)
            sources = additionalConfig.sources;
        let filters:Array<FilterInput> = [{
            field:FieldName.TargetId,
            operation:OperationType.Equals,
            source: Source.PdbEntity,
            values:[entityId]
        },{
            field:FieldName.TargetId,
            operation:OperationType.Contains,
            source:Source.PdbInstance,
            values:[instanceId]
        }];
        if(additionalConfig != null && additionalConfig.filters!=null && additionalConfig.filters.length>0)
            filters = additionalConfig.filters;
        this.sequenceCollector.collect({
            queryId: upAcc,
            from: SequenceReference.Uniprot,
            to: SequenceReference.PdbInstance,
            filterByTargetContains: instanceId,
            excludeFirstRowLink: true
        }).then(seqResult=>{
            this.annotationCollector.collect({
                queryId: upAcc,
                reference: SequenceReference.Uniprot,
                sources:sources,
                filters:filters,
                collectSwissModel:true
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