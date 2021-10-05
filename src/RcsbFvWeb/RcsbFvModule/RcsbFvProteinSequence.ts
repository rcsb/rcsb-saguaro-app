import {Source} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {SequenceCollectorDataInterface} from "../../RcsbCollectTools/SequenceCollector/SequenceCollector";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";

export class RcsbFvProteinSequence extends RcsbFvAbstractModule {

    public async build(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {
        const queryId: string = buildConfig.queryId;
        const source: Array<Source> = buildConfig.sources ?? [Source.Uniprot];
        const seqResult:SequenceCollectorDataInterface = await this.sequenceCollector.collect({
            queryId: queryId,
            from: buildConfig.from,
            to: buildConfig.to,
            dynamicDisplay:true
        });
        const annResult: Array<RcsbFvRowConfigInterface> = await this.annotationCollector.collect({
            queryId: queryId,
            reference: buildConfig.from,
            sources:source,
            collectSwissModel:true
        });
        this.boardConfigData.length = this.sequenceCollector.getSequenceLength();
        this.boardConfigData.includeAxis = true;
        if(buildConfig.additionalConfig?.hideAlignments){
            this.rowConfigData = seqResult.sequence.concat(annResult);
        }else if(buildConfig.additionalConfig.bottomAlignments){
            this.rowConfigData = seqResult.sequence.concat(annResult).concat(seqResult.alignment);
        }else{
            this.rowConfigData = seqResult.sequence.concat(seqResult.alignment).concat(annResult);
        }
        await this.display();
        return void 0;
    }

}