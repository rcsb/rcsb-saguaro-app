import {
    AnnotationFeatures,
    Feature,
    FieldName,
    FilterInput,
    OperationType,
    SequenceReference,
    Source
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvAdditionalConfig, RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {TagDelimiter} from "../../RcsbUtils/TagDelimiter";

export class RcsbFvUniprotEntity extends RcsbFvAbstractModule {

    protected async protectedBuild(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {
        const upAcc: string = buildConfig.upAcc;
        const entityId: string = buildConfig.entityId;
        const additionalConfig:RcsbFvAdditionalConfig = buildConfig.additionalConfig
        const filters:Array<FilterInput> = [{
            field:FieldName.TargetId,
            operation:OperationType.Equals,
            source: Source.PdbEntity,
            values:[entityId]
        }];
        this.alignmentTracks = await this.sequenceCollector.collect({
            queryId: upAcc,
            from: SequenceReference.Uniprot,
            to: SequenceReference.PdbEntity,
            filterByTargetContains: entityId,
            excludeAlignmentLinks: true
        }, buildConfig.additionalConfig?.alignmentFilter);
        this.annotationTracks = await this.annotationCollector.collect({
            queryId: upAcc,
            reference: SequenceReference.Uniprot,
            sources:additionalConfig?.sources ? additionalConfig.sources : [Source.PdbEntity, Source.Uniprot],
            filters:additionalConfig?.filters instanceof Array ? additionalConfig.filters.concat(filters) : filters,
            titleSuffix: this.titleSuffix.bind(this)
        });
        this.boardConfigData.length = this.sequenceCollector.getSequenceLength();
        this.boardConfigData.includeAxis = true;
        return void 0;

    }

    protected concatAlignmentAndAnnotationTracks(buildConfig: RcsbFvModuleBuildInterface): void {
        this.rowConfigData = this.alignmentTracks.sequence.concat(this.alignmentTracks.alignment).concat(this.annotationTracks);
    }

    private async titleSuffix(ann: AnnotationFeatures, d: Feature): Promise<string|undefined>{
        if( this.polymerEntityInstance != null && ann.source === Source.PdbInstance){
            const labelAsymId: string = ann.target_id.split(TagDelimiter.instance)[1];
            const authAsymId: string = this.polymerEntityInstance.translateAsymToAuth(labelAsymId);
            return labelAsymId === authAsymId ? labelAsymId : labelAsymId+"[auth "+authAsymId+"]";
        }
        return void 0;
    }

}