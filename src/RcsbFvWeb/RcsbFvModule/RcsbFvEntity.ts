import {
    AlignmentResponse,
    AnnotationFeatures, Feature,
    SequenceReference,
    Source
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {TagDelimiter} from "../../RcsbUtils/Helpers/TagDelimiter";
import {
    CollectAnnotationsInterface
} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {CollectAlignmentInterface} from "../../RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface";
import {Assertions} from "../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;

export class RcsbFvEntity extends RcsbFvAbstractModule {

    protected async protectedBuild(): Promise<void> {
        const buildConfig: RcsbFvModuleBuildInterface = this.buildConfig;
        assertDefined(buildConfig.entityId);
        const alignmentRequestContext:CollectAlignmentInterface = {
            queryId: buildConfig.entityId,
            from: SequenceReference.PdbEntity,
            to: SequenceReference.Uniprot,
            externalTrackBuilder: buildConfig.additionalConfig?.externalTrackBuilder
        }
        const alignmentResponse: AlignmentResponse = await this.alignmentCollector.collect(alignmentRequestContext, buildConfig.additionalConfig?.alignmentFilter);
        await this.buildAlignmentTracks(alignmentRequestContext, alignmentResponse);

        const annotationsRequestContext: CollectAnnotationsInterface = {
            queryId: buildConfig.entityId,
            reference: SequenceReference.PdbEntity,
            sources: buildConfig.additionalConfig?.sources ?? [Source.PdbEntity, Source.Uniprot],
            titleSuffix: this.titleSuffix.bind(this),
            filters: buildConfig.additionalConfig?.filters,
            annotationProcessing:buildConfig.additionalConfig?.annotationProcessing,
            externalTrackBuilder: buildConfig.additionalConfig?.externalTrackBuilder
        };
        const annotationsFeatures: AnnotationFeatures[] = await this.annotationCollector.collect(annotationsRequestContext);
        await this.buildAnnotationsTrack(annotationsRequestContext,annotationsFeatures);

        this.boardConfigData.length = await this.alignmentCollector.getAlignmentLength();
        this.boardConfigData.includeAxis = true;
        return void 0;
    }

    protected concatAlignmentAndAnnotationTracks(): void {
        const buildConfig: RcsbFvModuleBuildInterface = this.buildConfig;
        this.rowConfigData = !buildConfig.additionalConfig?.hideAlignments ?
            [this.referenceTrack].concat(this.alignmentTracks).concat(this.annotationTracks)
            :
            [this.referenceTrack].concat(this.alignmentTracks).concat(this.annotationTracks);
    }

    private async titleSuffix(ann: AnnotationFeatures, d: Feature): Promise<string|undefined>{
        if(!ann.target_id)
            return;
        if( this.polymerEntityInstance != null && ann.source === Source.PdbInstance){
            const labelAsymId: string = ann.target_id.split(TagDelimiter.instance)[1];
            const authAsymId: string | undefined = this.polymerEntityInstance.translateAsymToAuth(labelAsymId);
            return labelAsymId === authAsymId ? labelAsymId : labelAsymId+"[auth "+authAsymId+"]";
        }
    }

}