import {Source} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";

export class RcsbFvProteinSequence extends RcsbFvAbstractModule {

    protected async protectedBuild(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {
        const queryId: string = buildConfig.queryId;
        const source: Array<Source> = buildConfig.sources ?? [Source.Uniprot];
        this.alignmentTracks = await this.sequenceCollector.collect({
            queryId: queryId,
            from: buildConfig.from,
            to: buildConfig.to,
            dynamicDisplay:true
        });
        this.annotationTracks = await this.annotationCollector.collect({
            queryId: queryId,
            reference: buildConfig.from,
            sources:source,
            collectSwissModel:true
        });
        this.boardConfigData.length = this.sequenceCollector.getSequenceLength();
        this.boardConfigData.includeAxis = true;
        return void 0;
    }

    protected concatAlignmentAndAnnotationTracks(buildConfig: RcsbFvModuleBuildInterface): void {
        if(buildConfig.additionalConfig?.hideAlignments){
            this.rowConfigData = this.alignmentTracks.sequence.concat(this.annotationTracks);
        }else if(buildConfig.additionalConfig.bottomAlignments){
            this.rowConfigData = this.alignmentTracks.sequence.concat(this.annotationTracks).concat(this.alignmentTracks.alignment);
        }else{
            this.rowConfigData = this.alignmentTracks.sequence.concat(this.alignmentTracks.alignment).concat(this.annotationTracks);
        }
    }

}