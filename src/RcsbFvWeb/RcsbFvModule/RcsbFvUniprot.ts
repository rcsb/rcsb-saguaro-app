import {SequenceReference, Source} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {ObservedSequenceCollector} from "../../RcsbCollectTools/SequenceCollector/ObservedSequenceCollector";
import {SequenceCollectorInterface} from "../../RcsbCollectTools/SequenceCollector/SequenceCollectorInterface";

export class RcsbFvUniprot extends RcsbFvAbstractModule {

    protected readonly sequenceCollector: SequenceCollectorInterface = new ObservedSequenceCollector();

    protected async protectedBuild(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {
        const upAcc: string = buildConfig.upAcc;
        const source: Array<Source> = [Source.Uniprot];
        this.alignmentTracks = await this.sequenceCollector.collect({
            queryId: upAcc,
            from: SequenceReference.Uniprot,
            to: SequenceReference.PdbEntity,
            dynamicDisplay:false,
            fitTitleWidth:true,
            excludeFirstRowLink: true
        }, buildConfig.additionalConfig?.alignmentFilter);
        this.annotationTracks = await this.annotationCollector.collect({
            queryId: upAcc,
            reference: SequenceReference.Uniprot,
            sources:source,
            collectSwissModel:true
        });
        this.boardConfigData.length = this.sequenceCollector.getSequenceLength();
        this.boardConfigData.includeAxis = true;
        return void 0;
    }

    protected concatAlignmentAndAnnotationTracks(buildConfig: RcsbFvModuleBuildInterface): void {
        this.rowConfigData = !buildConfig.additionalConfig?.hideAlignments ?
            this.alignmentTracks.sequence.concat(this.annotationTracks).concat(this.alignmentTracks.alignment)
            :
            this.alignmentTracks.sequence.concat(this.annotationTracks);
    }

}