import {
    AnnotationFeatures,
    Feature,
    SequenceReference,
    Source, Type
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {AnnotationCollectorInterface} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {AnnotationCollector} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollector";

import * as acm from "../../RcsbAnnotationConfig/RcsbInterfaceConfig.ac.json";
import {AnnotationConfigInterface} from "../../RcsbAnnotationConfig/AnnotationConfigInterface";
import {rcsbFvCtxManager} from "../RcsbFvBuilder/RcsbFvContextManager";

const annotationConfigMap: AnnotationConfigInterface = <any>acm;

export class RcsbFvInterface extends RcsbFvAbstractModule {

    protected readonly annotationCollector: AnnotationCollectorInterface = new AnnotationCollector(annotationConfigMap);

    protected async protectedBuild(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {
        const instanceId: string = buildConfig.instanceId;
        //const source: Array<Source> = [Source.PdbEntity, Source.PdbInstance, Source.Uniprot];
        const source: Array<Source> = [Source.PdbInterface];

        this.alignmentTracks = await this.sequenceCollector.collect({
            queryId: instanceId,
            from: SequenceReference.PdbInstance,
            to: SequenceReference.Uniprot});

        this.annotationTracks = await this.annotationCollector.collect({
                queryId: instanceId,
                reference: SequenceReference.PdbInstance,
                titleSuffix: this.titleSuffix.bind(this),
                trackTitle: this.trackTitle.bind(this),
                sources:source
        });

        this.boardConfigData.length = this.sequenceCollector.getSequenceLength();
        this.boardConfigData.includeAxis = true;
        return void 0;
    }

    protected concatAlignmentAndAnnotationTracks(buildConfig:RcsbFvModuleBuildInterface): void {
        this.rowConfigData =
            !buildConfig.additionalConfig?.hideAlignments ?
                this.alignmentTracks.sequence.concat(this.alignmentTracks.alignment).concat(this.annotationTracks)
                :
                this.alignmentTracks.sequence.concat(this.annotationTracks);
    }

    private async titleSuffix(ann: AnnotationFeatures, d: Feature): Promise<string> {
        if(ann.source === Source.PdbInterface) {
            const interfaceTranslate = await rcsbFvCtxManager.getInterfaceToInstance(ann.target_id);
            return " " + interfaceTranslate.getInstances(ann.target_id).join("-");
        }
    }

    private async trackTitle(ann: AnnotationFeatures, d: Feature): Promise<string> {
        if (ann.source === Source.PdbInterface && d.type === Type.BurialFraction) {
            return "BINDING SITE ";
        }
    }
}