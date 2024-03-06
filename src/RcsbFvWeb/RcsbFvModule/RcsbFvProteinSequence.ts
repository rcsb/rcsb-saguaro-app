import {
    SequenceAlignments,
    SequenceAnnotations,
    AnnotationReference
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {AnnotationsCollectConfig} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {CollectAlignmentInterface} from "../../RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface";
import {Assertions} from "../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;

export class RcsbFvProteinSequence extends RcsbFvAbstractModule {

    protected async protectedBuild(): Promise<void> {
        const buildConfig: RcsbFvModuleBuildInterface = this.buildConfig;
        const queryId: string | undefined = buildConfig.queryId;
        assertDefined(queryId);
        const source: Array<AnnotationReference> = buildConfig.sources ?? [AnnotationReference.Uniprot];
        const alignmentRequestContext: CollectAlignmentInterface = {
            queryId: queryId,
            from: buildConfig.from as any,
            to: buildConfig.to as any,
            dynamicDisplay:true,
            externalTrackBuilder: buildConfig.additionalConfig?.externalTrackBuilder
        };
        const alignmentResponse: SequenceAlignments = await this.alignmentCollector.collect(alignmentRequestContext, buildConfig.additionalConfig?.alignmentFilter);
        await this.buildAlignmentTracks(alignmentRequestContext, alignmentResponse);

        const annotationsRequestContext: AnnotationsCollectConfig = {
            queryId: queryId,
            reference: buildConfig.from as any,
            sources:source,
            annotationProcessing:buildConfig.additionalConfig?.annotationProcessing,
            externalTrackBuilder: buildConfig.additionalConfig?.externalTrackBuilder
        };
        const annotationsFeatures: SequenceAnnotations[] = await this.annotationCollector.collect(annotationsRequestContext);
        await this.buildAnnotationsTrack(annotationsRequestContext,annotationsFeatures);

        this.boardConfigData.length = await this.alignmentCollector.getAlignmentLength();
        this.boardConfigData.includeAxis = true;
        return void 0;
    }

    protected concatAlignmentAndAnnotationTracks(): void {
        const buildConfig: RcsbFvModuleBuildInterface = this.buildConfig;
        if(buildConfig.additionalConfig?.hideAlignments){
            this.rowConfigData = [this.referenceTrack].concat(this.annotationTracks);
        }else if(buildConfig.additionalConfig?.bottomAlignments){
            this.rowConfigData = [this.referenceTrack].concat(this.annotationTracks).concat(this.alignmentTracks);
        }else{
            this.rowConfigData = [this.referenceTrack].concat(this.alignmentTracks).concat(this.annotationTracks);
        }
    }

}