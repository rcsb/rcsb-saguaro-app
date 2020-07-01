import {
    FieldName,
    FilterInput,
    OperationType,
    SequenceReference,
    Source
} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvCore} from "./RcsbFvCore";
import {RcsbFvModuleInterface, RcsbFvAdditionalConfig} from "./RcsbFvModuleInterface";

export class RcsbFvUniprotInstance extends RcsbFvCore implements RcsbFvModuleInterface{

    public build(upAcc: string, entityId:string, instanceId: string, updateFlag: boolean, additionalConfig?:RcsbFvAdditionalConfig): void {
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
            filterByTargetContains: instanceId
        }).then(seqResult=>{
            this.annotationCollector.collect({
                queryId: upAcc,
                reference: SequenceReference.Uniprot,
                sources:sources,
                filters:filters
            }).then(annResult=>{
                this.boardConfigData.length = this.sequenceCollector.getLength();
                this.boardConfigData.includeAxis = true;
                this.rowConfigData = seqResult.sequence.concat(seqResult.alignment).concat(annResult);
                if(updateFlag){
                    this.update();
                }else {
                    this.display();
                }
            }).catch(error=>{
                console.error(error);
            });
        }).catch(error=>{
            console.error(error);
        });
    }

}