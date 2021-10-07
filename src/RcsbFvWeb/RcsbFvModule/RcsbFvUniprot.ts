import {SequenceReference, Source} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {RcsbFv, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {ObservedSequenceCollector} from "../../RcsbCollectTools/SequenceCollector/ObservedSequenceCollector";
import {SequenceCollectorDataInterface} from "../../RcsbCollectTools/SequenceCollector/SequenceCollector";
import {SequenceCollectorInterface} from "../../RcsbCollectTools/SequenceCollector/SequenceCollectorInterface";

export class RcsbFvUniprot extends RcsbFvAbstractModule {

    protected readonly sequenceCollector: SequenceCollectorInterface = new ObservedSequenceCollector();

    constructor(elementId: string, rcsbFv: RcsbFv) {
        super(elementId, rcsbFv);
    }

    public async build(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {
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
        await this.display();
        return void 0;
    }

}