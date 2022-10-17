import {
    AlignmentResponse,
    AnnotationFeatures,
    FieldName,
    OperationType,
    SequenceReference,
    Source,
    Type
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {CollectAnnotationsInterface} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {rcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {UniprotAlignmentTrackFactory} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/UniprotAlignmentTrackFactory";

export class RcsbFvUniprot extends RcsbFvAbstractModule {

    protected async protectedBuild(): Promise<void> {
        const buildConfig: RcsbFvModuleBuildInterface = this.buildConfig;
        const upAcc: string = buildConfig.upAcc;
        const source: Array<Source> = [Source.Uniprot];

        const alignmentRequestContext = {
                queryId: upAcc,
                from: SequenceReference.Uniprot,
                to: SequenceReference.PdbEntity,
                dynamicDisplay:false,
                fitTitleWidth:true,
                excludeFirstRowLink: true
        };
        const alignmentResponse: AlignmentResponse = await this.alignmentCollector.collect(alignmentRequestContext, buildConfig.additionalConfig?.alignmentFilter);
        const trackFactory: UniprotAlignmentTrackFactory = new UniprotAlignmentTrackFactory(this.getPolymerEntityInstanceTranslator());
        await trackFactory.prepareFeatures(await collectUnobservedRegions(upAcc), await  collectLocalScores(upAcc));
        await this.buildAlignmentTracks(alignmentRequestContext, alignmentResponse, {
            alignmentTrackFactory: trackFactory
        });

        const annotationsRequestContext: CollectAnnotationsInterface = {
            queryId: upAcc,
            reference: SequenceReference.Uniprot,
            sources:source,
            annotationProcessing:buildConfig.additionalConfig?.annotationProcessing,
            externalAnnotationTrackBuilder: buildConfig.additionalConfig?.externalTrackBuilder
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
            [this.referenceTrack].concat(this.annotationTracks).concat(this.alignmentTracks)
            :
            [this.referenceTrack].concat(this.annotationTracks);
    }

}

async function collectUnobservedRegions(upAcc: string): Promise<Array<AnnotationFeatures>> {
    return await rcsbClient.requestRcsbPdbAnnotations({
        queryId: upAcc,
        reference: SequenceReference.Uniprot,
        sources: [Source.PdbInstance],
        filters: [{
            source:Source.PdbInstance,
            operation: OperationType.Equals,
            field:FieldName.Type,
            values:[Type.UnobservedResidueXyz]
        }]
    });
}

async function collectLocalScores(upAcc: string): Promise<Array<AnnotationFeatures>> {
    return await rcsbClient.requestRcsbPdbAnnotations({
        queryId: upAcc,
        reference: SequenceReference.Uniprot,
        sources: [Source.PdbInstance],
        filters: [{
            source:Source.PdbInstance,
            operation: OperationType.Equals,
            field:FieldName.Type,
            values:[Type.MaQaMetricLocalTypePlddt]
        }]
    });
}