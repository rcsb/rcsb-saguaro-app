import {
    AlignmentResponse,
    AnnotationFeatures,
    SequenceReference,
    Source
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {buriedResidues, buriedResiduesFilter} from "../../RcsbUtils/TrackGenerators/BuriedResidues";
import {BlockFactoryInterface} from "../RcsbFvFactories/RcsbFvBlockFactory/BlockFactoryInterface";
import {
    AlignmentRequestContextType,
    AlignmentTrackFactory
} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory";
import {AlignmentBlockFactory} from "../RcsbFvFactories/RcsbFvBlockFactory/AlignmentBlockFactory";
import {SequenceTrackFactory} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/SequenceTrackFactory";
import {CollectAnnotationsInterface} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";

export class RcsbFvInstance extends RcsbFvAbstractModule {

    protected async protectedBuild(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {
        const instanceId: string = buildConfig.instanceId;
        const source: Array<Source> = [Source.PdbEntity, Source.PdbInstance, Source.Uniprot];

        const alignmentRequestContext = {
            queryId: instanceId,
            from: SequenceReference.PdbInstance,
            to: SequenceReference.Uniprot
        };
        const alignmentResponse: AlignmentResponse = await this.alignmentCollector.collect(alignmentRequestContext, buildConfig.additionalConfig?.alignmentFilter);
        await this.buildAlignmentTracks(alignmentRequestContext, alignmentResponse);

        const annotationsRequestContext: CollectAnnotationsInterface = {
            queryId: instanceId,
            reference: SequenceReference.PdbInstance,
            annotationGenerator: (ann)=>(new Promise<AnnotationFeatures[]>((r)=>(r(buriedResidues(ann))))),
            annotationFilter: (ann)=>(new Promise<AnnotationFeatures[]>((r)=>(r(buriedResiduesFilter(ann))))),
            sources:source
        };
        const annotationsFeatures: AnnotationFeatures[] = await this.annotationCollector.collect(annotationsRequestContext);
        await this.buildAnnotationsTrack(annotationsRequestContext,annotationsFeatures);

        this.boardConfigData.length = await this.alignmentCollector.getAlignmentLength();
        this.boardConfigData.includeAxis = true;
        return void 0;
    }

    protected concatAlignmentAndAnnotationTracks(buildConfig:RcsbFvModuleBuildInterface): void {
        this.rowConfigData =
            !buildConfig.additionalConfig?.hideAlignments ?
                [this.referenceTrack].concat(this.alignmentTracks).concat(this.annotationTracks)
                :
                this.alignmentTracks.concat(this.annotationTracks);
    }

}