import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvAdditionalConfig, RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {RcsbFv, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {AnnotationCollectorInterface} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {AnnotationCollector} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollector";
import {AnnotationConfigInterface} from "../../RcsbAnnotationConfig/AnnotationConfigInterface";
import * as acm from "../../RcsbAnnotationConfig/BindingSiteConfig.ac.json";
import {
    SequenceCollector,
    SequenceCollectorDataInterface
} from "../../RcsbCollectTools/SequenceCollector/SequenceCollector";
import {SequenceCollectorInterface} from "../../RcsbCollectTools/SequenceCollector/SequenceCollectorInterface";

const annotationConfigMap: AnnotationConfigInterface = <any>acm;
export class RcsbFvGroupAnnotation extends RcsbFvAbstractModule {

    protected readonly annotationCollector: AnnotationCollectorInterface = new AnnotationCollector(annotationConfigMap);
    protected readonly sequenceCollector: SequenceCollectorInterface;

    constructor(elementId: string, rcsbFv: RcsbFv, additionalConfig?: RcsbFvAdditionalConfig) {
        super(elementId, rcsbFv);
        if(additionalConfig?.sequenceCollector)
            this.sequenceCollector = additionalConfig.sequenceCollector;
        else
            this.sequenceCollector = new SequenceCollector();
    }

    public async protectedBuild(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {

        this.alignmentTracks = await this.sequenceCollector.collect({
            group: buildConfig.group,
            groupId: buildConfig.groupId,
            filter: buildConfig.additionalConfig?.alignmentFilter,
            page: buildConfig.additionalConfig?.page,
            from: buildConfig.from,
            to: buildConfig.to,
            dynamicDisplay:false,
            fitTitleWidth:true,
            excludeFirstRowLink: true,
            sequencePrefix: buildConfig.additionalConfig?.sequencePrefix
        });

        this.annotationTracks = await this.annotationCollector.collect({
            group: buildConfig.group,
            groupId: buildConfig.groupId,
            sources:buildConfig.additionalConfig?.sources,
            filters:buildConfig.additionalConfig?.filters,
            annotationProcessing:buildConfig.additionalConfig?.annotationProcessing,
            externalAnnotationTrackBuilder: buildConfig.additionalConfig?.externalTrackBuilder
        });

        this.boardConfigData.length = this.sequenceCollector.getSequenceLength();
        this.boardConfigData.includeAxis = true;

        return void 0;
    }

    protected concatAlignmentAndAnnotationTracks(buildConfig: RcsbFvModuleBuildInterface): void {
        this.rowConfigData = this.alignmentTracks.sequence ? this.alignmentTracks.sequence.concat(this.annotationTracks) : this.annotationTracks;
    }
}
