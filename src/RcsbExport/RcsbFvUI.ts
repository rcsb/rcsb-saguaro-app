import {RcsbFvCoreBuilder} from "../RcsbFvWeb/RcsbFvBuilder/RcsbFvCoreBuilder";
import {GroupedOptionsInterface, SelectOptionInterface} from "../RcsbFvWeb/RcsbFvComponents/SelectButton";
import {SelectButtonConfigInterface} from "../RcsbFvWeb/RcsbFvComponents/SelectButtonManager";

export class RcsbFvUI {

    static clearSelectButton(elementFvId: string, selectButtonId: string){
        RcsbFvCoreBuilder.clearAdditionalSelectButton(elementFvId, selectButtonId);
    }

    static createSelectButton(elementFvId: string, selectButtonId: string, options: SelectOptionInterface[]|GroupedOptionsInterface[], config?:SelectButtonConfigInterface){
        RcsbFvCoreBuilder.buildSelectButton(elementFvId, selectButtonId, options, config);
    }

    static addSelectButton(elementFvId: string, selectButtonId: string, options: SelectOptionInterface[], config?:SelectButtonConfigInterface){
        RcsbFvCoreBuilder.addSelectButton(elementFvId, selectButtonId, options, config);
    }

}
