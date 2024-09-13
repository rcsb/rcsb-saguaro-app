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
    AlignmentCollectorInterface,
    CollectGroupAlignmentInterface
} from "../../RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface";
import {Assertions} from "../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;
import {TagDelimiter} from "@rcsb/rcsb-api-tools/build/RcsbUtils/TagDelimiter";
import {Operator} from "../../RcsbUtils/Helpers/Operator";
import {rcsbRequestCtxManager} from "../../RcsbRequest/RcsbRequestContextManager";
import {ExternalTrackBuilderInterface} from "../../RcsbCollectTools/FeatureTools/ExternalTrackBuilderInterface";
import {
    AnnotationCollectorInterface
} from "../../RcsbCollectTools/AnnotationCollector/AnnotationCollectorInterface";
import {rcsbClient} from "../../RcsbGraphQL/RcsbClient";

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

        const targetList: string[] = uniqueTargetList(alignmentResponse);
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

        collectNextPage(alignmentRequestContext, this.alignmentCollector, this.annotationCollector).then(()=>console.log("Next page ready"));

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

async function collectNextPage(alignmentRequestContext: CollectGroupAlignmentInterface, alignmentCollector: AlignmentCollectorInterface, annotationCollector: AnnotationCollectorInterface): Promise<void> {
    const alignmentResponse: SequenceAlignments = await rcsbClient.requestGroupAlignment({
        group: alignmentRequestContext.group,
        groupId: alignmentRequestContext.groupId,
        page: {
            first: alignmentRequestContext.page.first,
            after: alignmentRequestContext.page.after + alignmentRequestContext.page.first
        },
        excludeLogo: true
    });
    const targetList: string[] = uniqueTargetList(alignmentResponse);
    if(alignmentRequestContext.groupId) {
        const alignmentFeatures: SequenceAnnotations[] = await rcsbClient.requestRcsbPdbGroupAnnotations(buildGroupAnnotationQuery({
            groupId: alignmentRequestContext.groupId,
            targetList
        }));
        const featureTargetList = Operator.uniqueValues<string>(alignmentFeatures.map(af=>TagDelimiter.parseInstance(af.target_id ?? "").entryId));
        Operator.arrayChunk(featureTargetList,100).forEach(ids => rcsbRequestCtxManager.getEntryProperties(ids));
    }
}

function uniqueTargetList(alignmentResponse: SequenceAlignments): string[] {
    return Operator.uniqueValues<string>(alignmentResponse.target_alignments?.map(ta=>{
        assertDefined(ta?.target_id);
        return TagDelimiter.parseEntity(ta.target_id).entryId
    }) ?? []);
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
        groupId: annotationsContext.groupId,
        group: GroupReference.SequenceIdentity,
        sources: [AnnotationReference.PdbInstance],
        filters: [{
            source:AnnotationReference.PdbInstance,
            operation: OperationType.Equals,
            field:FieldName.Type,
            values:[FeaturesType.UnobservedResidueXyz,FeaturesType.MaQaMetricLocalTypePlddt]
        },{
            source:AnnotationReference.PdbInstance,
            operation: OperationType.Contains,
            field:FieldName.TargetId,
            values:annotationsContext.targetList
        }]
    }
}