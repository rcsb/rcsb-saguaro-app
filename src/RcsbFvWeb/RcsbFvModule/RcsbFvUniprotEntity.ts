import {
    AlignmentResponse,
    AnnotationFeatures,
    Feature,
    FieldName,
    FilterInput,
    OperationType,
    SequenceReference,
    Source
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvAdditionalConfig, RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {TagDelimiter} from "../../RcsbUtils/Helpers/TagDelimiter";
import {CollectAnnotationsInterface} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";

export class RcsbFvUniprotEntity extends RcsbFvAbstractModule {

    protected async protectedBuild(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {
        const upAcc: string = buildConfig.upAcc;
        const entityId: string = buildConfig.entityId;
        const additionalConfig:RcsbFvAdditionalConfig = buildConfig.additionalConfig
        const filters:Array<FilterInput> = [{
            field:FieldName.TargetId,
            operation:OperationType.Equals,
            source: Source.PdbEntity,
            values:[entityId]
        }];
        const alignmentRequestContext = {
            queryId: upAcc,
            from: SequenceReference.Uniprot,
            to: SequenceReference.PdbEntity,
            filterByTargetContains: entityId,
            excludeAlignmentLinks: true
        };
        const alignmentResponse: AlignmentResponse = await this.alignmentCollector.collect(alignmentRequestContext, [entityId]);
        await this.buildAlignmentTracks(alignmentRequestContext, alignmentResponse);

        const annotationsRequestContext: CollectAnnotationsInterface = {
            queryId: upAcc,
            reference: SequenceReference.Uniprot,
            sources:additionalConfig?.sources ? additionalConfig.sources : [Source.PdbEntity, Source.Uniprot],
            filters:additionalConfig?.filters instanceof Array ? additionalConfig.filters.concat(filters) : filters,
            titleSuffix: this.titleSuffix.bind(this),
            annotationProcessing:buildConfig.additionalConfig?.annotationProcessing,
            externalAnnotationTrackBuilder: buildConfig.additionalConfig?.externalTrackBuilder
        };
        const annotationsFeatures: AnnotationFeatures[] = await this.annotationCollector.collect(annotationsRequestContext);
        await this.buildAnnotationsTrack(annotationsRequestContext,annotationsFeatures);

        this.boardConfigData.length = await this.alignmentCollector.getAlignmentLength();
        this.boardConfigData.includeAxis = true;
        return void 0;

    }

    protected concatAlignmentAndAnnotationTracks(buildConfig: RcsbFvModuleBuildInterface): void {
        this.rowConfigData = [this.referenceTrack].concat(this.alignmentTracks).concat(this.annotationTracks);
    }

    private async titleSuffix(ann: AnnotationFeatures, d: Feature): Promise<string|undefined>{
        if( this.polymerEntityInstance != null && ann.source === Source.PdbInstance){
            const labelAsymId: string = ann.target_id.split(TagDelimiter.instance)[1];
            const authAsymId: string = this.polymerEntityInstance.translateAsymToAuth(labelAsymId);
            return labelAsymId === authAsymId ? labelAsymId : labelAsymId+"[auth "+authAsymId+"]";
        }
        return void 0;
    }

}