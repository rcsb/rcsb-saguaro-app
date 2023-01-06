import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import { RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {
    CollectGroupAnnotationsInterface
} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {AnnotationConfigInterface} from "../../RcsbAnnotationConfig/AnnotationConfigInterface";
import * as acm from "../../RcsbAnnotationConfig/GroupAnnotationConfig.ac.json";
import {AlignmentResponse, AnnotationFeatures} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {TrackFactoryInterface} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryInterface";
import {AlignmentRequestContextType} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory";
import {SequenceTrackFactory} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/SequenceTrackFactory";
import {CollectGroupAlignmentInterface} from "../../RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface";
import {Assertions} from "../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;

const annotationConfigMap: AnnotationConfigInterface = <any>acm;
export class RcsbFvGroupAnnotation extends RcsbFvAbstractModule {

    public async protectedBuild(): Promise<void> {
        const buildConfig: RcsbFvModuleBuildInterface = this.buildConfig;
        assertDefined(buildConfig.group), assertDefined(buildConfig.groupId), assertDefined(buildConfig.additionalConfig?.page);
        const alignmentRequestContext: CollectGroupAlignmentInterface = {
            group: buildConfig.group,
            groupId: buildConfig.groupId,
            filter: buildConfig.additionalConfig?.alignmentFilter,
            page: buildConfig.additionalConfig?.page,
            from: buildConfig.from,
            to: buildConfig.to,
            dynamicDisplay:false,
            fitTitleWidth:true,
            excludeFirstRowLink: true,
            sequencePrefix: buildConfig.additionalConfig?.sequencePrefix ?? "",
            externalTrackBuilder: buildConfig.additionalConfig?.externalTrackBuilder
        }
        const alignmentResponse: AlignmentResponse = await this.alignmentCollector.collect(alignmentRequestContext, buildConfig.additionalConfig?.alignmentFilter);
        const sequenceTrackFactory:TrackFactoryInterface<[AlignmentRequestContextType, string]> = new SequenceTrackFactory(this.getPolymerEntityInstanceTranslator())
        if(alignmentResponse.query_sequence)
            this.referenceTrack = await sequenceTrackFactory.getTrack(alignmentRequestContext,alignmentResponse.query_sequence);

        const annotationsRequestContext: CollectGroupAnnotationsInterface = {
            group: buildConfig.group,
            groupId: buildConfig.groupId,
            sources:buildConfig.additionalConfig?.sources,
            filters:buildConfig.additionalConfig?.filters,
            annotationProcessing:buildConfig.additionalConfig?.annotationProcessing,
            externalTrackBuilder: buildConfig.additionalConfig?.externalTrackBuilder
        }
        const annotationsFeatures: AnnotationFeatures[] = await this.annotationCollector.collect(annotationsRequestContext);
        await this.buildAnnotationsTrack(annotationsRequestContext,annotationsFeatures,annotationConfigMap);

        this.boardConfigData.length = await this.alignmentCollector.getAlignmentLength();
        this.boardConfigData.includeAxis = true;

        return void 0;
    }

    protected concatAlignmentAndAnnotationTracks(): void {
        this.rowConfigData = this.referenceTrack ? [this.referenceTrack].concat(this.alignmentTracks).concat(this.annotationTracks) : this.alignmentTracks.concat(this.annotationTracks);
    }
}
