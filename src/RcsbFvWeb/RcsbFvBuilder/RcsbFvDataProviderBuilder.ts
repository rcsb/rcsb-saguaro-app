import {RcsbFvAdditionalConfig, RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {RcsbFvDataProvider} from "../RcsbFvModule/RcsbFvDataProvider";

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
            }catch (e){
                reject(e);
            }
        });
    }
}