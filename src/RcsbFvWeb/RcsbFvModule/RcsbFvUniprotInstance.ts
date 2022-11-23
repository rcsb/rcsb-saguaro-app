import {
    AlignmentResponse,
    AnnotationFeatures,
    FieldName,
    FilterInput,
    OperationType,
    SequenceReference,
    Source
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvAdditionalConfig, RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {buriedResidues, buriedResiduesFilter} from "../../RcsbUtils/TrackGenerators/BuriedResidues";
import {CollectAnnotationsInterface} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {CollectAlignmentInterface} from "../../RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface";

export class RcsbFvUniprotInstance extends RcsbFvAbstractModule {

    protected async protectedBuild(): Promise<void> {
        const buildConfig: RcsbFvModuleBuildInterface = this.buildConfig;
        const upAcc: string = buildConfig.upAcc;
        const entityId:string = buildConfig.entityId;
        const instanceId: string = buildConfig.instanceId;
        const additionalConfig:RcsbFvAdditionalConfig = buildConfig.additionalConfig;
        let sources: Array<Source> = [Source.Uniprot, Source.PdbEntity, Source.PdbInstance];
        if(additionalConfig != null && additionalConfig.sources!=null && additionalConfig.sources.length>0)
            sources = additionalConfig.sources;
        let filters:Array<FilterInput> = [{
            field:FieldName.TargetId,
            operation:OperationType.Equals,
            source: Source.PdbEntity,
            values:[entityId]
        },{
            field:FieldName.TargetId,
            operation:OperationType.Contains,
            source:Source.PdbInstance,
            values:[instanceId]
        }];
        if(additionalConfig != null && additionalConfig.filters!=null && additionalConfig.filters.length>0)
            filters = additionalConfig.filters;
        const alignmentRequestContext: CollectAlignmentInterface = {
            queryId: upAcc,
            from: SequenceReference.Uniprot,
            to: SequenceReference.PdbInstance,
            filterByTargetContains: instanceId,
            excludeFirstRowLink: true,
            externalTrackBuilder: buildConfig.additionalConfig?.externalTrackBuilder
        }
        const alignmentResponse: AlignmentResponse = await this.alignmentCollector.collect(alignmentRequestContext, [instanceId]);
        await this.buildAlignmentTracks(alignmentRequestContext, alignmentResponse);

        const annotationsRequestContext: CollectAnnotationsInterface = {
            queryId: upAcc,
            reference: SequenceReference.Uniprot,
            sources:sources,
            filters:filters,
            annotationGenerator: (ann)=>(new Promise<AnnotationFeatures[]>((r)=>(r(buriedResidues(ann))))),
            annotationFilter: (ann)=>(new Promise<AnnotationFeatures[]>((r)=>(r(buriedResiduesFilter(ann))))),
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
        this.rowConfigData = [this.referenceTrack].concat(this.alignmentTracks).concat(this.annotationTracks);
    }

}