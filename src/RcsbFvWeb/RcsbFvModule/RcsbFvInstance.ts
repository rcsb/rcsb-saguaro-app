import {SequenceReference, Source} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";

export class RcsbFvInstance extends RcsbFvAbstractModule {

    protected async protectedBuild(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {
        const instanceId: string = buildConfig.instanceId;
        const source: Array<Source> = [Source.PdbEntity, Source.PdbInstance, Source.Uniprot];

        this.alignmentTracks = await this.sequenceCollector.collect({
            queryId: instanceId,
            from: SequenceReference.PdbInstance,
            to: SequenceReference.Uniprot});

        this.annotationTracks = await this.annotationCollector.collect({
                queryId: instanceId,
                reference: SequenceReference.PdbInstance,
                sources:source
        });

        this.boardConfigData.length = this.sequenceCollector.getSequenceLength();
        this.boardConfigData.includeAxis = true;
        return void 0;
    }

    protected concatAlignmentAndAnnotationTracks(buildConfig:RcsbFvModuleBuildInterface): void {
        this.rowConfigData =
            !buildConfig.additionalConfig?.hideAlignments ?
                this.alignmentTracks.sequence.concat(this.alignmentTracks.alignment).concat(this.annotationTracks)
                :
                this.alignmentTracks.sequence.concat(this.annotationTracks);
    }

}