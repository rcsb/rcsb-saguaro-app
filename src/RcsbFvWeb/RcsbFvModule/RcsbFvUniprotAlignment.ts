import {
    SequenceAlignments,
    SequenceAnnotations,
    FieldName,
    GroupReference,
    OperationType,
    SequenceReference,
    AnnotationReference,
    Type
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {AnnotationsCollectConfig} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {rcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {
    MsaAlignmentTrackFactory
} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/MsaAlignmentTrackFactory";
import {CollectGroupAlignmentInterface} from "../../RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface";
import {Assertions} from "../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;

export class RcsbFvUniprotAlignment extends RcsbFvAbstractModule {

    protected async protectedBuild(): Promise<void> {
        const buildConfig: RcsbFvModuleBuildInterface = this.buildConfig;
        assertDefined(buildConfig.additionalConfig?.page), assertDefined(buildConfig.upAcc);
        const alignmentRequestContext: CollectGroupAlignmentInterface = {
            group: GroupReference.MatchingUniprotAccession,
            groupId: buildConfig.upAcc,
            filter: buildConfig.additionalConfig?.alignmentFilter,
            page: buildConfig.additionalConfig?.page,
            from: SequenceReference.Uniprot,
            to: SequenceReference.PdbEntity,
            dynamicDisplay:false,
            fitTitleWidth:true,
            excludeFirstRowLink: true,
            sequencePrefix: buildConfig.additionalConfig?.sequencePrefix ?? "",
            externalTrackBuilder: buildConfig.additionalConfig?.externalTrackBuilder
        }
        const alignmentResponse: SequenceAlignments = await this.alignmentCollector.collect(alignmentRequestContext, buildConfig.additionalConfig?.alignmentFilter);
        const trackFactory: MsaAlignmentTrackFactory = new MsaAlignmentTrackFactory(this.getPolymerEntityInstanceTranslator());
        const alignmentFeatures: SequenceAnnotations[] = await collectFeatures(buildConfig.upAcc);
        await trackFactory.prepareFeatures(
            alignmentFeatures.map(af=>({...af, feature:af.features?.filter(f=>f?.type==Type.UnobservedResidueXyz)})),
            alignmentFeatures.map(af=>({...af, feature:af.features?.filter(f=>f?.type==Type.MaQaMetricLocalTypePlddt)}))
        );
        await this.buildAlignmentTracks(alignmentRequestContext, alignmentResponse, {
            alignmentTrackFactory: trackFactory
        });

        const annotationsRequestContext: AnnotationsCollectConfig = {
            queryId: buildConfig.upAcc,
            reference: SequenceReference.Uniprot,
            sources:[AnnotationReference.Uniprot],
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
        this.rowConfigData = !buildConfig.additionalConfig?.hideAlignments ?
            [this.referenceTrack].concat(this.annotationTracks).concat(this.alignmentTracks)
            :
            [this.referenceTrack].concat(this.annotationTracks);
    }

}

async function collectFeatures(upAcc: string): Promise<Array<SequenceAnnotations>> {
    return await rcsbClient.requestRcsbPdbAnnotations({
        queryId: upAcc,
        reference: SequenceReference.Uniprot,
        sources: [AnnotationReference.PdbInstance],
        filters: [{
            source:AnnotationReference.PdbInstance,
            operation: OperationType.Equals,
            field:FieldName.Type,
            values:[Type.UnobservedResidueXyz,Type.MaQaMetricLocalTypePlddt]
        }]
    });
}