import {SequenceReference, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvCore} from "./RcsbFvCore";
import {RcsbFvModuleBuildInterface, RcsbFvModuleInterface} from "./RcsbFvModuleInterface";
import {RcsbFv} from "@bioinsilico/rcsb-saguaro";
import {ObservedSequenceCollector} from "../CollectTools/ObservedCollector";

export class RcsbFvUniprot extends RcsbFvCore implements RcsbFvModuleInterface{

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
            to: SequenceReference.PdbInstance,
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
                this.boardConfigData.length = this.sequenceCollector.getLength();
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