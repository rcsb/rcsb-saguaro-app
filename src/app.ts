import {GroupedOptionsInterface, SelectOptionInterface} from "./RcsbFvWeb/WebTools/SelectButton";

export {
    buildEntryChromosome,
    buildFullChromosome,
    buildEntityChromosome,
    buildChromosome,
    buildEntityFv,
    buildEntitySummaryFv,
    buildSingleEntitySummaryFv,
    buildInstanceFv,
    buildInstanceSequenceFv,
    buildMultipleInstanceSequenceFv,
    buildAssemblySequenceFv,
    buildPairwiseAlignment,
    buildPfv,
    buildMultipleAlignmentSequenceFv,
    buildUniprotEntityFv,
    buildUniprotEntityInstanceFv,
    buildUniprotFv,
    unmount
} from "./RcsbFvWeb/RcsbFvBuilder";

import {RcsbFvCoreBuilder} from "./RcsbFvWeb/RcsbFvBuilder/RcsbFvCoreBuilder";
import {SelectButtonConfigInterface} from "./RcsbFvWeb/WebTools/WebToolsManager";
import {InterfaceInstanceTranslate} from "./RcsbUtils/Translators/InterfaceInstanceTranslate";
import {rcsbFvCtxManager} from "./RcsbFvWeb/RcsbFvBuilder/RcsbFvContextManager";

export class RcsbFvUI {

    static clearSelectButton(elementFvId: string, selectButtonId: string){
        RcsbFvCoreBuilder.clearAdditionalSelectButton(elementFvId, selectButtonId);
    }

    static createSelectButton(elementFvId: string, selectButtonId: string, options: Array<SelectOptionInterface>|Array<GroupedOptionsInterface>, config?:SelectButtonConfigInterface){
        RcsbFvCoreBuilder.buildSelectButton(elementFvId, selectButtonId, options, config);
    }

    static addSelectButton(elementFvId: string, selectButtonId: string, options: Array<SelectOptionInterface>, config?:SelectButtonConfigInterface){
        RcsbFvCoreBuilder.addSelectButton(elementFvId, selectButtonId, options, config);
    }

}

export class RcsbFvContextManager {
    static async getInterfaceToInstance(interfaceId:string): Promise<InterfaceInstanceTranslate>{
        return rcsbFvCtxManager.getInterfaceToInstance(interfaceId);
    }
}