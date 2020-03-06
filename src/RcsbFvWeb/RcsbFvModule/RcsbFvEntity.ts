import {SequenceReference, Source} from "../../RcsbGraphQL/Types/GqlTypes";
import {RcsbFvCore} from "./RcsbFvCore";

export class RcsbFvEntity extends RcsbFvCore {

    public build(entityId: string, uniprot?: Source): void {
        const source: Array<Source> = [Source.PdbEntity];
        if(uniprot != null)
            source.push(Source.Uniprot);
        this.sequenceCollector.collect({
            queryId: entityId,
            from: SequenceReference.PdbEntity,
            to: SequenceReference.Uniprot
        }).then(seqResult=>{
            this.annotationCollector.collect({
                queryId: entityId,
                reference: SequenceReference.PdbEntity,
                source:source
            }).then(annResult=>{
                this.boardConfigData.length = this.sequenceCollector.getLength();
                this.boardConfigData.includeAxis = true;
                this.rowConfigData = seqResult.sequence.concat(seqResult.alignment).concat(annResult);
                this.display();
            }).catch(error=>{
                console.error(error);
            });
        }).catch(error=>{
            console.error(error);
        });
    }

}