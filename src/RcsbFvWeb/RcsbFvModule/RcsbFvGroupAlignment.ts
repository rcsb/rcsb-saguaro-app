import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvAdditionalConfig, RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";

import {RcsbFv} from "@rcsb/rcsb-saguaro";
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
        }, buildConfig.additionalConfig?.alignmentFilter);

        this.boardConfigData.length = this.sequenceCollector.getSequenceLength();
        this.boardConfigData.includeAxis = true;
        this.rowConfigData =  seqResult.sequence.concat(seqResult.alignment);
        await this.display();

        return void 0;
    }

}
