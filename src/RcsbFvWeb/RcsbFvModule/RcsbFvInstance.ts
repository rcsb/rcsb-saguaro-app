import {SequenceReference, Source} from "../../RcsbGraphQL/Types/GqlTypes";
import {RcsbFvCore} from "./RcsbFvCore";

export class RcsbFvInstance extends RcsbFvCore {

    public build(upAcc: string): void {
        const source: Array<Source> = [Source.PdbEntity, Source.PdbInstance, Source.Uniprot];
        this.sequenceCollector.collect({
            queryId: upAcc,
            from: SequenceReference.Uniprot,
            to: SequenceReference.PdbEntity
        }).then(seqResult=>{
            this.annotationCollector.collect({
                queryId: upAcc,
                reference: SequenceReference.Uniprot,
                source:source
            }).then(annResult=>{
                this.boardConfigData.length = this.sequenceCollector.getLength();
                this.boardConfigData.includeAxis = true;
                this.rowConfigData = seqResult.sequence.concat(annResult).concat(seqResult.alignment);
                this.display();
            }).catch(error=>{
                console.error(error);
            });
        }).catch(error=>{
            console.error(error);
        });
    }

}