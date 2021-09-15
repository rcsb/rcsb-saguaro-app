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

    public async build(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {

        const seqResult:SequenceCollectorDataInterface = await this.sequenceCollector.collect({
            group: buildConfig.group,
            groupId: buildConfig.groupId,
            from: buildConfig.from,
            to: buildConfig.to,
            dynamicDisplay:false,
            fitTitleWidth:true,
            excludeFirstRowLink: true,
            sequencePrefix: buildConfig.additionalConfig?.sequencePrefix
        });

        const annResult: Array<RcsbFvRowConfigInterface> = await this.annotationCollector.collect({
            group: buildConfig.group,
            groupId: buildConfig.groupId,
            sources:buildConfig.additionalConfig?.sources,
            filters:buildConfig.additionalConfig?.filters,
            annotationProcessing:buildConfig.additionalConfig?.annotationProcessing,
            externalAnnotationTrackBuilder: buildConfig.additionalConfig?.externalTrackBuilder
        });

        if(buildConfig.additionalConfig?.externalTrackBuilder){
            buildConfig.additionalConfig.externalTrackBuilder.processAlignmentAndFeatures({
                annotations: await this.annotationCollector.getAnnotationFeatures(),
                alignments: await this.sequenceCollector.getAlignmentResponse()
            })
            buildConfig.additionalConfig.externalTrackBuilder.addTo({
                annotationTracks: annResult,
                alignmentTracks: seqResult
            });
        }

        this.boardConfigData.length = this.sequenceCollector.getSequenceLength();
        this.boardConfigData.includeAxis = true;

        this.rowConfigData = seqResult.sequence ? seqResult.sequence.concat(annResult) : annResult;
        await this.display();

        return void 0;
    }

}
