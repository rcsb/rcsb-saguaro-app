import {SequenceReference, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface, RcsbFvModuleInterface} from "./RcsbFvModuleInterface";
import {RcsbFv} from "@rcsb/rcsb-saguaro";
import {ObservedSequenceCollector} from "../CollectTools/SequenceCollector/ObservedSequenceCollector";

export class RcsbFvUniprot extends RcsbFvAbstractModule implements RcsbFvModuleInterface{

    constructor(elementId: string, rcsbFv: RcsbFv) {
        super(elementId, rcsbFv);
        this.sequenceCollector = new ObservedSequenceCollector();
    }

    public build(buildConfig: RcsbFvModuleBuildInterface): void {
        const upAcc: string = buildConfig.upAcc;
        const source: Array<Source> = [Source.Uniprot];
        this.sequenceCollector.collect({
            queryId: upAcc,
            from: SequenceReference.Uniprot,
            to: SequenceReference.PdbEntity,
            dynamicDisplay:false,
            fitTitleWidth:true,
            excludeFirstRowLink: true
        }).then(seqResult=>{
            this.annotationCollector.collect({
                queryId: upAcc,
                reference: SequenceReference.Uniprot,
                sources:source,
                collectSwissModel:true
            }).then(annResult=>{
                this.boardConfigData.length = this.sequenceCollector.getSequenceLength();
                this.boardConfigData.includeAxis = true;
                this.rowConfigData = !buildConfig.additionalConfig?.hideAlignments ? seqResult.sequence.concat(annResult).concat(seqResult.alignment) : seqResult.sequence.concat(annResult);
                this.display();
                if(buildConfig.resolve!=null)buildConfig.resolve();
            }).catch(error=>{
                console.error(error);
            });
        }).catch(error=>{
            console.error(error);
        });
    }

}