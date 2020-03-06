import {SequenceReference, Source} from "../../RcsbGraphQL/Types/GqlTypes";
import {RcsbFvCore} from "./RcsbFvCore";

export class RcsbFvUniprot extends RcsbFvCore {

    public build(instanceId: string): void {
        const source: Array<Source> = [Source.Uniprot];
        this.sequenceCollector.collect({
            queryId: instanceId,
            from: SequenceReference.Uniprot,
            to: SequenceReference.PdbEntity
        }).then(seqResult=>{
            this.annotationCollector.collect({
                queryId: instanceId,
                reference: SequenceReference.PdbInstance,
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