import {SequenceReference, Source} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {SequenceCollectorDataInterface} from "../../RcsbCollectTools/SequenceCollector/SequenceCollector";

export class RcsbFvEntity extends RcsbFvAbstractModule {

    public async build(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {
        const entityId: string = buildConfig.entityId;
        const source: Array<Source> = buildConfig.additionalConfig?.filters? buildConfig.additionalConfig.sources : [Source.PdbEntity, Source.Uniprot];
        const seqResult:SequenceCollectorDataInterface = await this.sequenceCollector.collect({
            queryId: entityId,
            from: SequenceReference.PdbEntity,
            to: SequenceReference.Uniprot
        });
        const annResult: Array<RcsbFvRowConfigInterface> = await this.annotationCollector.collect({
                queryId: entityId,
                reference: SequenceReference.PdbEntity,
                sources:source,
                addTargetInTitle:new Set([Source.PdbInstance]),
                filters:buildConfig.additionalConfig?.filters
        });
        this.boardConfigData.length = this.sequenceCollector.getSequenceLength();
        this.boardConfigData.includeAxis = true;
        this.rowConfigData = !buildConfig.additionalConfig?.hideAlignments ? seqResult.sequence.concat(seqResult.alignment).concat(annResult) : seqResult.sequence.concat(seqResult.alignment).concat(annResult);
        await this.display();
        return void 0;
    }

}