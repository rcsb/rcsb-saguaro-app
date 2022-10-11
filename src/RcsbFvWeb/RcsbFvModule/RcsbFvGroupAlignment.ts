import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {
    AlignmentResponse,
    AnnotationFeatures,
    FieldName,
    GroupReference,
    OperationType,
    Source,
    Type
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {rcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {
    MsaAlignmentTrackFactory
} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/MsaAlignmentTrackFactory";
import {TagDelimiter} from "../../RcsbUtils/Helpers/TagDelimiter";

export class RcsbFvGroupAlignment extends RcsbFvAbstractModule {


    protected async protectedBuild(): Promise<void> {
        const buildConfig: RcsbFvModuleBuildInterface = this.buildConfig;
        const groupId: string = buildConfig.groupId;
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
        const trackFactory: MsaAlignmentTrackFactory = new MsaAlignmentTrackFactory(this.getPolymerEntityInstanceTranslator());

        const targetList: string[] = alignmentResponse.target_alignment.map(ta=>TagDelimiter.parseEntity(ta.target_id).entryId);
        const alignmentFeatures: AnnotationFeatures[] = await collectAlignmentFeatures(groupId, targetList);
        await trackFactory.prepareFeatures(
            alignmentFeatures.map(af=>({...af, feature:af.features.filter(f=>f.type==Type.UnobservedResidueXyz)})),
            alignmentFeatures.map(af=>({...af, feature:af.features.filter(f=>f.type==Type.MaQaMetricLocalTypePlddt)}))
        );
        await this.buildAlignmentTracks(alignmentRequestContext, alignmentResponse, {
            alignmentTrackFactory: trackFactory
        });

        this.boardConfigData.length = await this.alignmentCollector.getAlignmentLength();
        this.boardConfigData.includeAxis = true;

        return void 0;
    }

    protected concatAlignmentAndAnnotationTracks(): void {
        const buildConfig: RcsbFvModuleBuildInterface = this.buildConfig;
        this.rowConfigData =  this.referenceTrack ? [this.referenceTrack].concat(this.alignmentTracks) : this.alignmentTracks;
    }


}

async function collectAlignmentFeatures(groupId: string, targetList: string[]): Promise<Array<AnnotationFeatures>> {
    return await rcsbClient.requestRcsbPdbGroupAnnotations({
        histogram: false,
        groupId: groupId,
        group: GroupReference.SequenceIdentity,
        sources: [Source.PdbInstance],
        filters: [{
            source:Source.PdbInstance,
            operation: OperationType.Equals,
            field:FieldName.Type,
            values:[Type.UnobservedResidueXyz,Type.MaQaMetricLocalTypePlddt]
        },{
            source:Source.PdbInstance,
            operation: OperationType.Contains,
            field:FieldName.TargetId,
            values:targetList
        }]
    });
}