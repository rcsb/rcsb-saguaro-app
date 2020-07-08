import {SequenceReference, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvCore} from "./RcsbFvCore";
import {RcsbFvModuleBuildInterface, RcsbFvModuleInterface} from "./RcsbFvModuleInterface";

export class RcsbFvUniprot extends RcsbFvCore implements RcsbFvModuleInterface{

    public build(buildConfig: RcsbFvModuleBuildInterface): void {
        const upAcc: string = buildConfig.upAcc;
        const updateFlag: boolean = buildConfig.updateFlag;
        const source: Array<Source> = [Source.Uniprot];
        this.sequenceCollector.collect({
            queryId: upAcc,
            from: SequenceReference.Uniprot,
            to: SequenceReference.PdbEntity,
            dynamicDisplay:true
        }).then(seqResult=>{
            this.annotationCollector.collect({
                queryId: upAcc,
                reference: SequenceReference.Uniprot,
                sources:source,
                collectSwissModel:true
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