import {
    AnnotationFeatures, Feature,
    SequenceReference,
    Source
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {TagDelimiter} from "../../RcsbUtils/TagDelimiter";

export class RcsbFvEntity extends RcsbFvAbstractModule {

    protected async protectedBuild(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {
        const entityId: string = buildConfig.entityId;
        const source: Array<Source> = buildConfig.additionalConfig?.filters? buildConfig.additionalConfig.sources : [Source.PdbEntity, Source.Uniprot];
        this.alignmentTracks = await this.sequenceCollector.collect({
            queryId: entityId,
            from: SequenceReference.PdbEntity,
            to: SequenceReference.Uniprot
        });
        this.annotationTracks = await this.annotationCollector.collect({
                queryId: entityId,
                reference: SequenceReference.PdbEntity,
                sources:source,
                titleSuffix: this.titleSuffix.bind(this),
                filters:buildConfig.additionalConfig?.filters
        });
        this.boardConfigData.length = this.sequenceCollector.getSequenceLength();
        this.boardConfigData.includeAxis = true;
        return void 0;
    }

    protected concatAlignmentAndAnnotationTracks(buildConfig: RcsbFvModuleBuildInterface): void {
        this.rowConfigData = !buildConfig.additionalConfig?.hideAlignments ?
            this.alignmentTracks.sequence.concat(this.alignmentTracks.alignment).concat(this.annotationTracks)
            :
            this.alignmentTracks.sequence.concat(this.alignmentTracks.alignment).concat(this.annotationTracks);
    }

    private async titleSuffix(ann: AnnotationFeatures, d: Feature): Promise<string|undefined>{
        if( this.polymerEntityInstance != null && ann.source === Source.PdbInstance){
            const labelAsymId: string = ann.target_id.split(TagDelimiter.instance)[1];
            const authAsymId: string = this.polymerEntityInstance.translateAsymToAuth(labelAsymId);
            return labelAsymId === authAsymId ? labelAsymId : labelAsymId+"[auth "+authAsymId+"]";
        }
        return;
    }

}