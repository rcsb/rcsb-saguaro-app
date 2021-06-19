import {
    FieldName,
    FilterInput,
    OperationType,
    SequenceReference,
    Source
} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvAdditionalConfig, RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {RcsbFv, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {SequenceCollectorDataInterface} from "../CollectTools/SequenceCollector/SequenceCollector";

export class RcsbFvUniprotInstance extends RcsbFvAbstractModule {

    public async build(buildConfig: RcsbFvModuleBuildInterface): Promise<RcsbFv> {
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
        const seqResult:SequenceCollectorDataInterface = await this.sequenceCollector.collect({
            queryId: upAcc,
            from: SequenceReference.Uniprot,
            to: SequenceReference.PdbInstance,
            filterByTargetContains: instanceId,
            excludeFirstRowLink: true
        });
        const annResult: Array<RcsbFvRowConfigInterface> = await this.annotationCollector.collect({
            queryId: upAcc,
            reference: SequenceReference.Uniprot,
            sources:sources,
            filters:filters,
            collectSwissModel:true
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