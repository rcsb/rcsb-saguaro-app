import {
    SequenceAlignments,
    SequenceAnnotations,
    Feature,
    FieldName,
    AnnotationFilterInput,
    OperationType,
    SequenceReference,
    AnnotationReference
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvAdditionalConfig, RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {AnnotationsCollectConfig} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {CollectAlignmentInterface} from "../../RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface";
import {Assertions} from "../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;
import {TagDelimiter} from "@rcsb/rcsb-api-tools/build/RcsbUtils/TagDelimiter";

export class RcsbFvUniprotEntity extends RcsbFvAbstractModule {

    protected async protectedBuild(): Promise<void> {
        const buildConfig: RcsbFvModuleBuildInterface = this.buildConfig;
        const upAcc: string | undefined = buildConfig.upAcc;
        const entityId: string | undefined = buildConfig.entityId;
        const additionalConfig:RcsbFvAdditionalConfig | undefined = buildConfig.additionalConfig
        assertDefined(upAcc), assertDefined(entityId);
        const filters:Array<AnnotationFilterInput> = [{
            field:FieldName.TargetId,
            operation:OperationType.Equals,
            source: AnnotationReference.PdbEntity,
            values:[entityId]
        }];
        const alignmentRequestContext: CollectAlignmentInterface = {
            queryId: upAcc,
            from: SequenceReference.Uniprot,
            to: SequenceReference.PdbEntity,
            filterByTargetContains: entityId,
            excludeAlignmentLinks: true,
            externalTrackBuilder: buildConfig.additionalConfig?.externalTrackBuilder
        };
        const alignmentResponse: SequenceAlignments = await this.alignmentCollector.collect(alignmentRequestContext, [entityId]);
        await this.buildAlignmentTracks(alignmentRequestContext, alignmentResponse);

        const annotationsRequestContext: AnnotationsCollectConfig = {
            queryId: upAcc,
            reference: SequenceReference.Uniprot,
            sources:additionalConfig?.sources ? additionalConfig.sources : [AnnotationReference.PdbEntity, AnnotationReference.Uniprot],
            filters:additionalConfig?.filters instanceof Array ? additionalConfig.filters.concat(filters) : filters,
            titleSuffix: this.titleSuffix.bind(this),
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
        this.rowConfigData = [this.referenceTrack].concat(this.alignmentTracks).concat(this.annotationTracks);
    }

    private async titleSuffix(ann: SequenceAnnotations, d: Feature): Promise<string|undefined>{
        if( this.polymerEntityInstance != null && ann.source === AnnotationReference.PdbInstance){
            const labelAsymId: string | undefined = ann.target_id?.split(TagDelimiter.instance)[1];
            if(!labelAsymId)
                return;
            const authAsymId: string  | undefined = this.polymerEntityInstance.translateAsymToAuth(labelAsymId);
            return labelAsymId === authAsymId ? labelAsymId : labelAsymId+"[auth "+authAsymId+"]";
        }
    }

}