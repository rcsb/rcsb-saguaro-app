import {FieldName, OperationType, SequenceReference, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvCore} from "./RcsbFvCore";
import {RcsbFvModuleInterface} from "./RcsbFvModuleInterface";

export class RcsbFvUniprotEntity extends RcsbFvCore implements RcsbFvModuleInterface{

    public build(upAcc: string, entityId: string, updateFlag: boolean): void {
        const source: Array<Source> = [Source.PdbEntity, Source.PdbInstance];
        const pdbId:string = entityId.split("\.")[0];
        this.sequenceCollector.collect({
            queryId: upAcc,
            from: SequenceReference.Uniprot,
            to: SequenceReference.PdbEntity,
            filterByTargetContains: entityId
        }).then(seqResult=>{
            this.annotationCollector.collect({
                queryId: upAcc,
                reference: SequenceReference.Uniprot,
                sources:source,
                addTargetInTitle:new Set([Source.PdbInstance]),
                filters:[{
                    field:FieldName.TargetId,
                    operation:OperationType.Contains,
                    values:[pdbId]
                },{
                    field: FieldName.Type,
                    operation:OperationType.Equals,
                    source:Source.PdbInstance,
                    values:["UNOBSERVED_RESIDUE_XYZ","UNOBSERVED_ATOM_XYZ"]
                }]
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