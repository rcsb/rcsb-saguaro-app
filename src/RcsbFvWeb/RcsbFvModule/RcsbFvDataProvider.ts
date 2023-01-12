import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {
    AlignmentResponse,
    AnnotationFeatures
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";

export class RcsbFvDataProvider extends RcsbFvAbstractModule {

    protected async protectedBuild(): Promise<void> {
        if(this.buildConfig.additionalConfig?.dataProvider?.alignments) {
            const alignmentResponse: AlignmentResponse = await this.buildConfig.additionalConfig.dataProvider.alignments.collector.collect({
                ...this.buildConfig.additionalConfig?.dataProvider?.alignments.context
            }, this.buildConfig.additionalConfig?.alignmentFilter);
            await this.buildAlignmentTracks(this.buildConfig.additionalConfig?.dataProvider?.alignments.context, alignmentResponse,
                {
                    ...this.buildConfig.additionalConfig?.dataProvider?.alignments.trackFactories
                });
            this.boardConfigData.length = await this.buildConfig.additionalConfig?.dataProvider?.alignments.collector.getAlignmentLength();
        }
        if(this.buildConfig.additionalConfig?.dataProvider?.annotations){
            const annotationsFeatures: AnnotationFeatures[] = await this.buildConfig.additionalConfig.dataProvider.annotations.collector.collect({
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