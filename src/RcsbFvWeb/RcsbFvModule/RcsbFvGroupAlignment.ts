import {RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";

import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {
    SequenceAlignments,
    SequenceAnnotations,
    FieldName,
    GroupReference,
    OperationType,
    AnnotationReference,
    FeaturesType, QueryGroup_AnnotationsArgs
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    MsaAlignmentTrackFactory
} from "../RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/MsaAlignmentTrackFactory";
import {
    CollectGroupAlignmentInterface
} from "../../RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface";
import {Assertions} from "../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;
import {Operator} from "../../RcsbUtils/Helpers/Operator";
import {rcsbRequestCtxManager} from "../../RcsbRequest/RcsbRequestContextManager";
import {ExternalTrackBuilderInterface} from "../../RcsbCollectTools/FeatureTools/ExternalTrackBuilderInterface";
import {
    AnnotationCollectorInterface
} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";

export class RcsbFvGroupAlignment extends RcsbFvAbstractModule {

    protected async protectedBuild(): Promise<void> {
        const buildConfig: RcsbFvModuleBuildInterface = this.buildConfig;
        assertDefined(buildConfig.groupId), assertDefined(buildConfig.group), assertDefined(buildConfig.additionalConfig?.page);
        const alignmentRequestContext: CollectGroupAlignmentInterface = {
            group: buildConfig.group,
            groupId: buildConfig.groupId,
            filter: buildConfig.additionalConfig?.alignmentFilter,
            page: buildConfig.additionalConfig?.page,
            excludeLogo: buildConfig.additionalConfig?.excludeLogo,
            from: buildConfig.from,
            to: buildConfig.to,
            dynamicDisplay:false,
            fitTitleWidth:true,
            excludeFirstRowLink: true,
            sequencePrefix: buildConfig.additionalConfig?.sequencePrefix ?? "",
            externalTrackBuilder: buildConfig.additionalConfig?.externalTrackBuilder
        };


        const alignmentResponse: SequenceAlignments = await this.alignmentCollector.collect(alignmentRequestContext, buildConfig.additionalConfig?.alignmentFilter);

        const trackFactory: MsaAlignmentTrackFactory = new MsaAlignmentTrackFactory(this.getPolymerEntityInstanceTranslator());

        const targetList: string[] = await uniqueTargetList(alignmentResponse);
        const alignmentFeatures: SequenceAnnotations[] = await collectFeatures({
            groupId: buildConfig.groupId,
            externalTrackBuilder: buildConfig.additionalConfig?.externalTrackBuilder,
            targetList
        }, this.annotationCollector);

        await trackFactory.prepareFeatures(
            alignmentFeatures.map(af=>({...af, feature:af.features?.filter(f=>f?.type==FeaturesType.UnobservedResidueXyz)})),
            alignmentFeatures.map(af=>({...af, feature:af.features?.filter(f=>f?.type==FeaturesType.MaQaMetricLocalTypePlddt)}))
        );

        await this.buildAlignmentTracks(alignmentRequestContext, alignmentResponse, {
            alignmentTrackFactory: trackFactory
        });

        return void 0;
    }

    protected concatAlignmentAndAnnotationTracks(): void {
        this.rowConfigData =  this.referenceTrack ? [this.referenceTrack].concat(this.alignmentTracks) : this.alignmentTracks;
    }

    protected async getBoardConfig(): Promise<RcsbFvBoardConfigInterface> {
        return {
            ... this.boardConfigData,
            length: await this.alignmentCollector.getAlignmentLength(),
            includeAxis: true
        }
    }

}

async function uniqueTargetList(alignmentResponse: SequenceAlignments): Promise<string[]> {
    const entityIds: string[] =  Operator.uniqueValues<string>(alignmentResponse.target_alignments?.map(ta=>{
        assertDefined(ta?.target_id);
        return ta.target_id
    }) ?? []);
    const instanceIds = (await rcsbRequestCtxManager.getEntityProperties(entityIds)).map(e=>e.rcsbId);
    return Operator.uniqueValues<string>(instanceIds ?? []);
}

async function collectFeatures(annotationsContext: {groupId: string; targetList: string[]; externalTrackBuilder?: ExternalTrackBuilderInterface;}, annotationCollector: AnnotationCollectorInterface): Promise<Array<SequenceAnnotations>> {
    return await annotationCollector.collect({
        ...buildGroupAnnotationQuery(annotationsContext),
        isSummary: false,
        externalTrackBuilder: annotationsContext.externalTrackBuilder
    });
}

function buildGroupAnnotationQuery(annotationsContext: {groupId: string; targetList: string[]; externalTrackBuilder?: ExternalTrackBuilderInterface;}): QueryGroup_AnnotationsArgs {
    return  {
        group: GroupReference.SequenceIdentity,
        groupId: annotationsContext.groupId,
        sources: [AnnotationReference.PdbInstance],
        filters: [{
            source:AnnotationReference.PdbInstance,
            operation: OperationType.Equals,
            field:FieldName.Type,
            values:[FeaturesType.UnobservedResidueXyz,FeaturesType.MaQaMetricLocalTypePlddt]
        },{
            source:AnnotationReference.PdbInstance,
            operation: OperationType.Equals,
            field:FieldName.TargetId,
            values:annotationsContext.targetList
        }]
    }
}