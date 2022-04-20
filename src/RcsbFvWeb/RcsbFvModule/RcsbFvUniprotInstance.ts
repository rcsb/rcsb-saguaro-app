import {
    AnnotationFeatures,
    FieldName,
    FilterInput,
    OperationType,
    SequenceReference,
    Source
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvAdditionalConfig, RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {buriedResidues, buriedResiduesFilter} from "../../RcsbUtils/AnnotationGenerators/BuriedResidues";

export class RcsbFvUniprotInstance extends RcsbFvAbstractModule {

    protected async protectedBuild(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {
        const upAcc: string = buildConfig.upAcc;
        const entityId:string = buildConfig.entityId;
        const instanceId: string = buildConfig.instanceId;
        const additionalConfig:RcsbFvAdditionalConfig = buildConfig.additionalConfig;
        let sources: Array<Source> = [Source.Uniprot, Source.PdbEntity, Source.PdbInstance];
        if(additionalConfig != null && additionalConfig.sources!=null && additionalConfig.sources.length>0)
            sources = additionalConfig.sources;
        let filters:Array<FilterInput> = [{
            field:FieldName.TargetId,
            operation:OperationType.Equals,
            source: Source.PdbEntity,
            values:[entityId]
        },{
            field:FieldName.TargetId,
            operation:OperationType.Contains,
            source:Source.PdbInstance,
            values:[instanceId]
        }];
        if(additionalConfig != null && additionalConfig.filters!=null && additionalConfig.filters.length>0)
            filters = additionalConfig.filters;
        this.alignmentTracks = await this.sequenceCollector.collect({
            queryId: upAcc,
            from: SequenceReference.Uniprot,
            to: SequenceReference.PdbInstance,
            filterByTargetContains: instanceId,
            excludeFirstRowLink: true
        }, buildConfig.additionalConfig?.alignmentFilter);
        this.annotationTracks = await this.annotationCollector.collect({
            queryId: upAcc,
            reference: SequenceReference.Uniprot,
            sources:sources,
            filters:filters,
            annotationGenerator: (ann)=>(new Promise<AnnotationFeatures[]>((r)=>(r(buriedResidues(ann))))),
            annotationFilter: (ann)=>(new Promise<AnnotationFeatures[]>((r)=>(r(buriedResiduesFilter(ann))))),
            collectSwissModel:true
        });
        this.boardConfigData.length = this.sequenceCollector.getSequenceLength();
        this.boardConfigData.includeAxis = true;
        return void 0;
    }

    protected concatAlignmentAndAnnotationTracks(buildConfig: RcsbFvModuleBuildInterface): void {
        this.rowConfigData = this.alignmentTracks.sequence.concat(this.alignmentTracks.alignment).concat(this.annotationTracks);
    }

}