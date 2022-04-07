import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvAdditionalConfig, RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";

import {RcsbFv} from "@rcsb/rcsb-saguaro";
import {AnnotationCollectorInterface} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {AnnotationCollector} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollector";
import {AnnotationConfigInterface} from "../../RcsbAnnotationConfig/AnnotationConfigInterface";
import * as acm from "../../RcsbAnnotationConfig/GroupAnnotationConfig.ac.json";
import {
    SequenceCollector
} from "../../RcsbCollectTools/SequenceCollector/SequenceCollector";
import {SequenceCollectorInterface} from "../../RcsbCollectTools/SequenceCollector/SequenceCollectorInterface";

const annotationConfigMap: AnnotationConfigInterface = <any>acm;
export class RcsbFvGroupAlignment extends RcsbFvAbstractModule {

    protected readonly annotationCollector: AnnotationCollectorInterface = new AnnotationCollector(annotationConfigMap);
    protected readonly sequenceCollector: SequenceCollectorInterface;

    constructor(elementId: string, rcsbFv: RcsbFv, additionalConfig?: RcsbFvAdditionalConfig) {
        super(elementId, rcsbFv);
        if(additionalConfig?.sequenceCollector)
            this.sequenceCollector = additionalConfig.sequenceCollector;
        else
            this.sequenceCollector = new SequenceCollector();
    }

    protected async protectedBuild(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {

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
        }, buildConfig.additionalConfig?.alignmentFilter);

        this.boardConfigData.length = this.sequenceCollector.getSequenceLength();
        this.boardConfigData.includeAxis = true;

        return void 0;
    }

    protected concatAlignmentAndAnnotationTracks(buildConfig: RcsbFvModuleBuildInterface): void {
        this.rowConfigData =  this.alignmentTracks.sequence ? this.alignmentTracks.sequence.concat(this.alignmentTracks.alignment) : this.alignmentTracks.alignment;
    }

}
