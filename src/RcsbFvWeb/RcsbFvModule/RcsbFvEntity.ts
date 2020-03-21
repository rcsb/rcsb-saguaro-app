import {FieldName, OperationType, SequenceReference, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvCore} from "./RcsbFvCore";
import {RcsbFvModuleInterface} from "./RcsbFvModuleInterface";

export class RcsbFvEntity extends RcsbFvCore implements RcsbFvModuleInterface{

    public build(entityId: string, updateFlag: boolean): void {
        const source: Array<Source> = [Source.PdbEntity, Source.PdbInstance];
        this.sequenceCollector.collect({
            queryId: entityId,
            from: SequenceReference.PdbEntity,
            to: SequenceReference.Uniprot
        }).then(seqResult=>{
            this.annotationCollector.collect({
                queryId: entityId,
                reference: SequenceReference.PdbEntity,
                sources:source,
                addTargetInTitle:new Set([Source.PdbInstance]),
                filters:[{
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