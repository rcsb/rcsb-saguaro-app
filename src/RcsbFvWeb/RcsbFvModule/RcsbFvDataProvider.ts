import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {
    SequenceAlignments,
    SequenceAnnotations
} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    PlainAlignmentTrackFactory
} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/PlainAlignmentTrackFactory";

export class RcsbFvDataProvider extends RcsbFvAbstractModule {

    protected async protectedBuild(): Promise<void> {
        if(this.buildConfig.additionalConfig?.dataProvider?.alignments) {
            this.alignmentCollector = this.buildConfig.additionalConfig.dataProvider.alignments.collector;

            const alignmentResponse: SequenceAlignments = await this.alignmentCollector.collect({
                ...this.buildConfig.additionalConfig?.dataProvider?.alignments.context
            }, this.buildConfig.additionalConfig?.alignmentFilter);

            await this.buildAlignmentTracks(this.buildConfig.additionalConfig?.dataProvider?.alignments.context, alignmentResponse,
                {
                    alignmentTrackFactory: new PlainAlignmentTrackFactory(this.getPolymerEntityInstanceTranslator()),
                    ...this.buildConfig.additionalConfig?.dataProvider?.alignments.trackFactories
                });

            this.boardConfigData.length = await this.buildConfig.additionalConfig?.dataProvider?.alignments.collector.getAlignmentLength();
        }
        if(this.buildConfig.additionalConfig?.dataProvider?.annotations){
            this.annotationCollector = this.buildConfig.additionalConfig.dataProvider.annotations.collector

            const annotationsFeatures: SequenceAnnotations[] = await this.annotationCollector.collect({
                ...this.buildConfig.additionalConfig.dataProvider.annotations.context
            });

            await this.buildAnnotationsTrack(this.buildConfig.additionalConfig.dataProvider.annotations.context, annotationsFeatures);
        }
        this.boardConfigData.includeAxis = true;
    }

    protected concatAlignmentAndAnnotationTracks(): void {
        this.rowConfigData =  this.referenceTrack ? [this.referenceTrack].concat(this.alignmentTracks) : this.alignmentTracks;
    }

}