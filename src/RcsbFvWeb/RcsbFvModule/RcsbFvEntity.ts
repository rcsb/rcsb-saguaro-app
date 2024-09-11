import {
    SequenceAlignments,
    SequenceAnnotations, Features,
    SequenceReference,
    AnnotationReference
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {
    AnnotationsCollectConfig
} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {CollectAlignmentInterface} from "../../RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface";
import {Assertions} from "../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;
import {TagDelimiter} from "@rcsb/rcsb-api-tools/build/RcsbUtils/TagDelimiter";
import {RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {addUnmodeledTrackBuilder, UnmodeledTrackBuilder} from "../../RcsbUtils/TrackGenerators/UnmodeledTrackBuilder";

export class RcsbFvEntity extends RcsbFvAbstractModule {

    private readonly unmodeledTrackBuilder = new UnmodeledTrackBuilder();

    protected async protectedBuild(): Promise<void> {
        const buildConfig: RcsbFvModuleBuildInterface = this.buildConfig;
        assertDefined(buildConfig.entityId);
        const alignmentRequestContext:CollectAlignmentInterface = {
            queryId: buildConfig.entityId,
            from: SequenceReference.PdbEntity,
            to: SequenceReference.Uniprot,
            externalTrackBuilder: buildConfig.additionalConfig?.externalTrackBuilder
        }
        const alignmentResponse: SequenceAlignments = await this.alignmentCollector.collect(alignmentRequestContext, buildConfig.additionalConfig?.alignmentFilter);
        await this.buildAlignmentTracks(alignmentRequestContext, alignmentResponse);

        const annotationsRequestContext: AnnotationsCollectConfig = {
            queryId: buildConfig.entityId,
            reference: SequenceReference.PdbEntity,
            sources: buildConfig.additionalConfig?.sources ?? [AnnotationReference.PdbEntity, AnnotationReference.Uniprot],
            titleSuffix: this.titleSuffix.bind(this),
            filters: buildConfig.additionalConfig?.filters,
            annotationProcessing:buildConfig.additionalConfig?.annotationProcessing,
            rcsbContext:{
                entityId: buildConfig.entityId
            },
            externalTrackBuilder: addUnmodeledTrackBuilder(
                this.unmodeledTrackBuilder,
                buildConfig.additionalConfig?.externalTrackBuilder
            )
        };
        const annotationsFeatures: SequenceAnnotations[] = await this.annotationCollector.collect(annotationsRequestContext);
        await this.buildAnnotationsTrack(annotationsRequestContext,annotationsFeatures);

        this.boardConfigData.length = await this.alignmentCollector.getAlignmentLength();
        this.boardConfigData.includeAxis = true;
        return void 0;
    }

    protected async getBoardConfig(): Promise<RcsbFvBoardConfigInterface> {
        return {
            ... this.boardConfigData,
            tooltipGenerator: this.unmodeledTrackBuilder.getTooltip()
        };
    }

    protected concatAlignmentAndAnnotationTracks(): void {
        const buildConfig: RcsbFvModuleBuildInterface = this.buildConfig;
        this.rowConfigData = !buildConfig.additionalConfig?.hideAlignments ?
            [this.referenceTrack].concat(this.alignmentTracks).concat(this.annotationTracks)
            :
            [this.referenceTrack].concat(this.alignmentTracks).concat(this.annotationTracks);
    }

    private async titleSuffix(ann: SequenceAnnotations, d: Features): Promise<string|undefined>{
        if(!ann.target_id)
            return;
        if( this.polymerEntityInstance != null && ann.source === AnnotationReference.PdbInstance){
            const labelAsymId: string = ann.target_id.split(TagDelimiter.instance)[1];
            const authAsymId: string | undefined = this.polymerEntityInstance.translateAsymToAuth(labelAsymId);
            return labelAsymId === authAsymId ? labelAsymId : labelAsymId+"[auth "+authAsymId+"]";
        }
    }

}