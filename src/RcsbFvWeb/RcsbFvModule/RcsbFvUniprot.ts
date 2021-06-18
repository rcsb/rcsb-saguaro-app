import {SequenceReference, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface, RcsbFvModuleInterface} from "./RcsbFvModuleInterface";
import {RcsbFv, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {ObservedSequenceCollector} from "../CollectTools/SequenceCollector/ObservedSequenceCollector";
import {SequenceCollectorDataInterface} from "../CollectTools/SequenceCollector/SequenceCollector";

export class RcsbFvUniprot extends RcsbFvAbstractModule {

    constructor(elementId: string, rcsbFv: RcsbFv) {
        super(elementId, rcsbFv);
        this.sequenceCollector = new ObservedSequenceCollector();
    }

    public async build(buildConfig: RcsbFvModuleBuildInterface): Promise<RcsbFv> {
        const upAcc: string = buildConfig.upAcc;
        const source: Array<Source> = [Source.Uniprot];
        const seqResult:SequenceCollectorDataInterface = await this.sequenceCollector.collect({
            queryId: upAcc,
            from: SequenceReference.Uniprot,
            to: SequenceReference.PdbEntity,
            dynamicDisplay:false,
            fitTitleWidth:true,
            excludeFirstRowLink: true
        });
        const annResult: Array<RcsbFvRowConfigInterface> = await this.annotationCollector.collect({
            queryId: upAcc,
            reference: SequenceReference.Uniprot,
            sources:source,
            collectSwissModel:true
        });
        this.boardConfigData.length = this.sequenceCollector.getSequenceLength();
        this.boardConfigData.includeAxis = true;
        this.rowConfigData = !buildConfig.additionalConfig?.hideAlignments ? seqResult.sequence.concat(annResult).concat(seqResult.alignment) : seqResult.sequence.concat(annResult);
        this.display();
        if(buildConfig.resolve!=null)
            await buildConfig.resolve();
        return this.rcsbFv;
    }

}