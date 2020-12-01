import {RcsbFv, RcsbFvBoardConfigInterface} from '@rcsb/rcsb-saguaro';
import {RcsbFvAdditionalConfig } from "./RcsbFvModule/RcsbFvModuleInterface";
import {PairwiseAlignmentInterface} from "./PairwiseAlignmentTools/PairwiseAlignmentBuilder";
import {RcsbFvCoreBuilder} from "./RcsbFvBuilder/RcsbFvCoreBuilder";
import {RcsbFvChromosomeBuilder} from "./RcsbFvBuilder/RcsbFvChromosomeBuilder";
import {RcsbFvPairwiseAligmentBuilder} from "./RcsbFvBuilder/RcsbFvPairwiseAligmentBuilder";
import {RcsbFvUniprotBuilder} from "./RcsbFvBuilder/RcsbFvUniprotBuilder";
import {RcsbFvEntityBuilder} from "./RcsbFvBuilder/RcsbFvEntityBuilder";
import {InstanceSequenceOnchangeInterface, RcsbFvInstanceBuilder} from "./RcsbFvBuilder/RcsbFvInstanceBuilder";
import {rcsbFvCtxManager} from "./RcsbFvBuilder/RcsbFvContextManager";
import {PfvBuilderInterface, RcsbFvGeneralBuilder} from "./RcsbFvBuilder/RcsbFvGeneralBuilder";
import {RcsbFvAssemblyBuilder} from "./RcsbFvBuilder/RcsbFvAssemblyBuilder";

export function getRcsbFv(elementFvId: string): RcsbFv{
    return rcsbFvCtxManager.getFv(elementFvId);
}

export function setBoardConfig(boardConfigData: RcsbFvBoardConfigInterface): void{
    rcsbFvCtxManager.setBoardConfig(boardConfigData);
}

export function buildMultipleAlignmentSequenceFv(elementFvId: string, elementSelectId:string, upAcc: string): void {
    RcsbFvUniprotBuilder.buildUniprotMultipleEntitySequenceFv(elementFvId, elementSelectId, upAcc);
}

export function buildEntitySummaryFv(elementFvId: string, elementSelectId:string, entityId:string): void {
    RcsbFvEntityBuilder.buildEntitySummaryFv(elementFvId, elementSelectId, entityId);
}

export function buildSingleEntitySummaryFv(elementId: string, entityId: string): Promise<null> {
    return RcsbFvEntityBuilder.buildSingleEntitySummaryFv(elementId, entityId);
}

export function buildInstanceSequenceFv(elementFvId:string, elementSelectId:string, entryId: string, defaultValue?: string|undefined|null, onChangeCallback?:(x: InstanceSequenceOnchangeInterface)=>void): void {
    RcsbFvInstanceBuilder.buildInstanceSequenceFv(elementFvId, elementSelectId, entryId, defaultValue, onChangeCallback);
}

export function buildAssemblySequenceFv(elementFvId:string, elementSelectAssemblyId:string, elementSelectInstanceId:string, entryId: string, onAsseblyChangeCallback?:(x: string)=>void, onInstanceChangeCallback?:(x: InstanceSequenceOnchangeInterface)=>void): void {
    RcsbFvAssemblyBuilder.buildAssemblySequenceFv(elementFvId, elementSelectAssemblyId, elementSelectInstanceId, entryId, onAsseblyChangeCallback, onInstanceChangeCallback);
}

export function buildUniprotFv(elementId: string, upAcc: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<null> {
    return RcsbFvUniprotBuilder.buildUniprotFv(elementId, upAcc, additionalConfig);
}

export function buildEntityFv(elementId: string, entityId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<null> {
    return RcsbFvEntityBuilder.buildEntityFv(elementId, entityId, additionalConfig);
}

export function buildInstanceFv(elementId: string, instanceId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<null> {
    return RcsbFvInstanceBuilder.buildInstanceFv(elementId, instanceId, additionalConfig);

}

export function buildUniprotEntityFv(elementId: string, upAcc: string, entityId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<null> {
    return RcsbFvUniprotBuilder.buildUniprotEntityFv(elementId, upAcc, entityId, additionalConfig);
}

export function buildUniprotEntityInstanceFv(elementId: string, upAcc: string, entityId: string, instanceId: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<null> {
    return RcsbFvUniprotBuilder.buildUniprotEntityInstanceFv(elementId, upAcc, entityId, instanceId, additionalConfig);
}

export function buildPfv(elementId: string, config: PfvBuilderInterface): Promise<null> {
    return RcsbFvGeneralBuilder.buildPfv(elementId, config);
}

export function buildPairwiseAlignment(elementId:string, psa: PairwiseAlignmentInterface): void {
    RcsbFvPairwiseAligmentBuilder.buildPairwiseAlignment(elementId, psa);
}

export function buildFullChromosome(elementFvId:string, chrId: string){
    RcsbFvChromosomeBuilder.buildFullChromosome(elementFvId, chrId);
}

export function buildEntryChromosome(elementFvId:string, entitySelectId:string, chromosomeSelectId:string, entryId: string){
    RcsbFvChromosomeBuilder.buildEntryChromosome(elementFvId, entitySelectId, chromosomeSelectId, entryId);
}

export function buildEntityChromosome(elementFvId:string,elementSelectId:string,  entityId: string) {
    RcsbFvChromosomeBuilder.buildEntityChromosome(elementFvId, elementSelectId, entityId);
}

export function buildChromosome(elementFvId:string, entityId: string, chrId: string, elementSelectId?: string) {
    RcsbFvChromosomeBuilder.buildChromosome(elementFvId, chrId, elementSelectId);
}

export function unmount(elementId:string): void{
    RcsbFvCoreBuilder.unmount(elementId);
}