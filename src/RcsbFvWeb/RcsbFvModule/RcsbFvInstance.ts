import {
    AlignmentResponse,
    AnnotationFeatures,
    SequenceReference,
    Source
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {buriedResidues, buriedResiduesFilter} from "../../RcsbUtils/TrackGenerators/BuriedResidues";
import {AnnotationsCollectConfig} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {CollectAlignmentInterface} from "../../RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface";
import {SequenceTrackFactory} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/SequenceTrackFactory";
import {
    InstanceSequenceTrackTitleFactory
} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackTitleFactoryImpl/InstanceSequenceTrackTitleFactory";
import {Assertions} from "../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;

export class RcsbFvInstance extends RcsbFvAbstractModule {

    protected async protectedBuild(): Promise<void> {
        const buildConfig: RcsbFvModuleBuildInterface = this.buildConfig;
        const instanceId: string | undefined = buildConfig.instanceId;
        assertDefined(instanceId)
        const source: Array<Source> = [Source.PdbEntity, Source.PdbInstance, Source.Uniprot];

        const alignmentRequestContext: CollectAlignmentInterface = {
            queryId: instanceId,
            from: SequenceReference.PdbInstance,
            to: SequenceReference.Uniprot,
            externalTrackBuilder: buildConfig.additionalConfig?.externalTrackBuilder
        };
        const alignmentResponse: AlignmentResponse = await this.alignmentCollector.collect(alignmentRequestContext, buildConfig.additionalConfig?.alignmentFilter);
        await this.buildAlignmentTracks(alignmentRequestContext, alignmentResponse, {
            sequenceTrackFactory: new SequenceTrackFactory(this.getPolymerEntityInstanceTranslator(),new InstanceSequenceTrackTitleFactory(this.getPolymerEntityInstanceTranslator()))
        });

        const annotationsRequestContext: AnnotationsCollectConfig = {
            queryId: instanceId,
            reference: SequenceReference.PdbInstance,
            annotationGenerator: (ann)=>(new Promise<AnnotationFeatures[]>((r)=>(r(buriedResidues(ann))))),
            annotationFilter: (ann)=>(new Promise<AnnotationFeatures[]>((r)=>(r(buriedResiduesFilter(ann))))),
            sources:source,
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
        this.rowConfigData =
            !buildConfig.additionalConfig?.hideAlignments ?
                [this.referenceTrack].concat(this.alignmentTracks).concat(this.annotationTracks)
                :
                this.alignmentTracks.concat(this.annotationTracks);
    }

}