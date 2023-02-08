import {RcsbFvAdditionalConfig, RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {RcsbFvDataProvider} from "../RcsbFvModule/RcsbFvDataProvider";
import {GroupPfvUI} from "../../RcsbFvUI/GroupPfvUI";

export class RcsbFvDataProviderBuilder {
    static async buildFv(elementId:string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface> {
        return new Promise((resolve, reject)=>{
            try {
                RcsbFvCoreBuilder.createFv({
                    elementId,
                    fvModuleI: RcsbFvDataProvider,
                    config: {
                        resolve,
                        additionalConfig
                    }
                });
                GroupPfvUI.fvUI(
                    GroupPfvUI.addBootstrapElement(elementId),
                    additionalConfig?.externalUiComponents ? additionalConfig.externalUiComponents : []
                );
            }catch (e){
                reject(e);
            }
        });
    }
}