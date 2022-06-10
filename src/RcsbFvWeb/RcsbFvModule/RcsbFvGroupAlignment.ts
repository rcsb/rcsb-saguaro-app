import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {AlignmentResponse} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {PlainAlignmentTrackFactory} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/PlainAlignmentTrackFactory";

export class RcsbFvGroupAlignment extends RcsbFvAbstractModule {


    protected async protectedBuild(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {

        const alignmentRequestContext = {
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
        }
        const alignmentResponse: AlignmentResponse = await this.alignmentCollector.collect(alignmentRequestContext, buildConfig.additionalConfig?.alignmentFilter);
        await this.buildAlignmentTracks(alignmentRequestContext, alignmentResponse, new PlainAlignmentTrackFactory(this.getPolymerEntityInstanceTranslator()));

        this.boardConfigData.length = await this.alignmentCollector.getAlignmentLength();
        this.boardConfigData.includeAxis = true;

        return void 0;
    }

    protected concatAlignmentAndAnnotationTracks(buildConfig: RcsbFvModuleBuildInterface): void {
        this.rowConfigData =  this.referenceTrack ? [this.referenceTrack].concat(this.alignmentTracks) : this.alignmentTracks;
    }


}
