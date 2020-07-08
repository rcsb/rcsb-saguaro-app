import {
    FieldName,
    FilterInput,
    OperationType,
    SequenceReference,
    Source
} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvCore} from "./RcsbFvCore";
import {RcsbFvModuleInterface, RcsbFvAdditionalConfig, RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {TagDelimiter} from "../Utils/TagDelimiter";

export class RcsbFvUniprotEntity extends RcsbFvCore implements RcsbFvModuleInterface{

    public build(buildConfig: RcsbFvModuleBuildInterface): void {
        const upAcc: string = buildConfig.upAcc;
        const updateFlag: boolean = buildConfig.updateFlag;
        const additionalConfig:RcsbFvAdditionalConfig = buildConfig.additionalConfig
        const entityId: string = buildConfig.entityId;
        let sources: Array<Source> = [Source.PdbEntity, Source.PdbInstance];
        if(additionalConfig != null && additionalConfig.sources!=null && additionalConfig.sources.length>0)
            sources = additionalConfig.sources;
        const pdbId:string = entityId.split(TagDelimiter.entity)[0];
        let filters:Array<FilterInput> = [{
            field:FieldName.TargetId,
            operation:OperationType.Equals,
            source: Source.PdbEntity,
            values:[entityId]
        },{
            field:FieldName.TargetId,
            operation:OperationType.Contains,
            source:Source.PdbInstance,
            values:[pdbId]
        },{
            field: FieldName.Type,
            operation:OperationType.Equals,
            source:Source.PdbInstance,
            values:["UNOBSERVED_RESIDUE_XYZ","UNOBSERVED_ATOM_XYZ"]
        }];
        if(additionalConfig != null && additionalConfig.filters!=null && additionalConfig.filters.length>0)
            filters = additionalConfig.filters;
        this.sequenceCollector.collect({
            queryId: upAcc,
            from: SequenceReference.Uniprot,
            to: SequenceReference.PdbEntity,
            filterByTargetContains: entityId
        }).then(seqResult=>{
            this.annotationCollector.collect({
                queryId: upAcc,
                reference: SequenceReference.Uniprot,
                sources:sources,
                addTargetInTitle:new Set([Source.PdbInstance]),
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