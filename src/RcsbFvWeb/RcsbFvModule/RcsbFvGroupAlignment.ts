import {RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";

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
    AnnotationCollectorInterface,
    CollectGroupAnnotationsInterface
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

        collectNextPage(alignmentRequestContext, this.alignmentCollector, this.annotationCollector).then(()=>console.log("Next page ready"));

        const alignmentResponse: AlignmentResponse = await this.alignmentCollector.collect(alignmentRequestContext, buildConfig.additionalConfig?.alignmentFilter);

        const trackFactory: MsaAlignmentTrackFactory = new MsaAlignmentTrackFactory(this.getPolymerEntityInstanceTranslator());

        const targetList: string[] = uniqueTargetList(alignmentResponse);
        const alignmentFeatures: AnnotationFeatures[] = await collectFeatures({
            groupId: buildConfig.groupId,
            externalTrackBuilder: buildConfig.additionalConfig?.externalTrackBuilder,
            targetList
        }, this.annotationCollector);

        await trackFactory.prepareFeatures(
            alignmentFeatures.map(af=>({...af, feature:af.features?.filter(f=>f?.type==Type.UnobservedResidueXyz)})),
            alignmentFeatures.map(af=>({...af, feature:af.features?.filter(f=>f?.type==Type.MaQaMetricLocalTypePlddt)}))
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

async function collectNextPage(alignmentRequestContext: CollectGroupAlignmentInterface, alignmentCollector: AlignmentCollectorInterface, annotationCollector: AnnotationCollectorInterface): Promise<void> {
    const alignmentResponse: AlignmentResponse = await alignmentCollector.collect({
        ...alignmentRequestContext,
        excludeLogo: true,
        page: {
            first: alignmentRequestContext.page.first,
            after: (parseInt(alignmentRequestContext.page.after) + alignmentRequestContext.page.first).toString()
        }
    })
    const targetList: string[] = uniqueTargetList(alignmentResponse);
    if(alignmentRequestContext.groupId) {
        const alignmentFeatures: AnnotationFeatures[] = await collectFeatures({
            groupId: alignmentRequestContext.groupId,
            targetList
        }, annotationCollector);
        const featureTargetList = Operator.uniqueValues<string>(alignmentFeatures.map(af=>TagDelimiter.parseInstance(af.target_id ?? "").entryId));
        Operator.arrayChunk(featureTargetList,100).forEach(ids => rcsbRequestCtxManager.getEntryProperties(ids));
    }
}

function uniqueTargetList(alignmentResponse: AlignmentResponse): string[] {
    return Operator.uniqueValues<string>(alignmentResponse.target_alignment?.map(ta=>{
        assertDefined(ta?.target_id);
        return TagDelimiter.parseEntity(ta.target_id).entryId
    }) ?? []);
}

async function collectFeatures(annotationsContext: {groupId: string; targetList: string[]; externalTrackBuilder?: ExternalTrackBuilderInterface;}, annotationCollector: AnnotationCollectorInterface): Promise<Array<AnnotationFeatures>> {
    const annotationsRequestContext: CollectGroupAnnotationsInterface = {
        histogram: false,
        groupId: annotationsContext.groupId,
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
            values:annotationsContext.targetList
        }],
        externalTrackBuilder: annotationsContext.externalTrackBuilder
    }
    return await annotationCollector.collect(annotationsRequestContext);
}