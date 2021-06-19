import {
    FieldName, FilterInput, OperationType,
    SequenceReference,
    Source
} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleInterface, RcsbFvAdditionalConfig, RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {RcsbFv, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {SequenceCollectorDataInterface} from "../CollectTools/SequenceCollector/SequenceCollector";

export class RcsbFvUniprotEntity extends RcsbFvAbstractModule {

    public async build(buildConfig: RcsbFvModuleBuildInterface): Promise<RcsbFv> {
        const upAcc: string = buildConfig.upAcc;
        const entityId: string = buildConfig.entityId;
        const additionalConfig:RcsbFvAdditionalConfig = buildConfig.additionalConfig
        const filters:Array<FilterInput> = [{
            field:FieldName.TargetId,
            operation:OperationType.Equals,
            source: Source.PdbEntity,
            values:[entityId]
        }];
        const seqResult:SequenceCollectorDataInterface = await this.sequenceCollector.collect({
            queryId: upAcc,
            from: SequenceReference.Uniprot,
            to: SequenceReference.PdbEntity,
            filterByTargetContains: entityId,
            excludeAlignmentLinks: true
        });
        const annResult: Array<RcsbFvRowConfigInterface> = await this.annotationCollector.collect({
            queryId: upAcc,
            reference: SequenceReference.Uniprot,
            sources:additionalConfig?.sources ? additionalConfig.sources : [Source.PdbEntity, Source.Uniprot],
            addTargetInTitle:new Set([Source.PdbInstance]),
            filters:additionalConfig?.filters instanceof Array ? additionalConfig.filters.concat(filters) : filters
        });
        this.boardConfigData.length = this.sequenceCollector.getSequenceLength();
        this.boardConfigData.includeAxis = true;
        this.rowConfigData = seqResult.sequence.concat(seqResult.alignment).concat(annResult);
        this.display();
        if(buildConfig.resolve!=null)
            buildConfig.resolve(this);
        return this.rcsbFv;

    }

}