import {SequenceReference, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvCore} from "./RcsbFvCore";
import {RcsbFvModuleInterface} from "./RcsbFvModuleInterface";

export class RcsbFvInstance extends RcsbFvCore implements RcsbFvModuleInterface{

    public build(instanceId: string, updateFlag: boolean): void {
        const source: Array<Source> = [Source.PdbEntity, Source.PdbInstance, Source.Uniprot];
        this.sequenceCollector.collect({
            queryId: instanceId,
            from: SequenceReference.PdbInstance,
            to: SequenceReference.Uniprot
        }).then(seqResult=>{
            this.annotationCollector.collect({
                queryId: instanceId,
                reference: SequenceReference.PdbInstance,
                sources:source
            }).then(annResult=>{
                this.boardConfigData.length = this.sequenceCollector.getLength();
                this.boardConfigData.includeAxis = true;
                this.rowConfigData = seqResult.sequence.concat(annResult).concat(seqResult.alignment);
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