import {
    AlignmentResponse,
    AnnotationFeatures,
    Source
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {BlockFactoryInterface} from "../RcsbFvFactories/RcsbFvBlockFactory/BlockFactoryInterface";
import {
    AlignmentRequestContextType,
    AlignmentTrackFactory
} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory";
import {AlignmentBlockFactory} from "../RcsbFvFactories/RcsbFvBlockFactory/AlignmentBlockFactory";
import {SequenceTrackFactory} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/SequenceTrackFactory";
import {CollectAnnotationsInterface} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";

export class RcsbFvProteinSequence extends RcsbFvAbstractModule {

    protected async protectedBuild(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {
        const queryId: string = buildConfig.queryId;
        const source: Array<Source> = buildConfig.sources ?? [Source.Uniprot];
        const alignmentRequestContext = {
            queryId: queryId,
            from: buildConfig.from,
            to: buildConfig.to,
            dynamicDisplay:true
        };
        const alignmentResponse: AlignmentResponse = await this.alignmentCollector.collect(alignmentRequestContext, buildConfig.additionalConfig?.alignmentFilter);
        await this.buildAlignmentTracks(alignmentRequestContext, alignmentResponse);

        const annotationsRequestContext: CollectAnnotationsInterface = {
            queryId: queryId,
            reference: buildConfig.from,
            sources:source,
            collectSwissModel:true
        };
        const annotationsFeatures: AnnotationFeatures[] = await this.annotationCollector.collect(annotationsRequestContext);
        await this.buildAnnotationsTrack(annotationsRequestContext,annotationsFeatures);

        this.boardConfigData.length = await this.alignmentCollector.getAlignmentLength();
        this.boardConfigData.includeAxis = true;
        return void 0;
    }

    protected concatAlignmentAndAnnotationTracks(buildConfig: RcsbFvModuleBuildInterface): void {
        if(buildConfig.additionalConfig?.hideAlignments){
            this.rowConfigData = [this.referenceTrack].concat(this.annotationTracks);
        }else if(buildConfig.additionalConfig.bottomAlignments){
            this.rowConfigData = [this.referenceTrack].concat(this.annotationTracks).concat(this.alignmentTracks);
        }else{
            this.rowConfigData = [this.referenceTrack].concat(this.alignmentTracks).concat(this.annotationTracks);
        }
    }

}