import {RcsbFvAdditionalConfig, RcsbFvModulePublicInterface} from "../RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvCoreBuilder} from "./RcsbFvCoreBuilder";
import {RcsbFvGroup} from "../RcsbFvModule/RcsbFvGroup";
import {GroupReference} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";

export class RcsbFvGroupBuilder {

    static async buildUniprotEntityGrouptFv(elementId: string, upAcc: string, additionalConfig?:RcsbFvAdditionalConfig): Promise<RcsbFvModulePublicInterface> {
        return new Promise<RcsbFvModulePublicInterface>((resolve,reject)=> {
            try {
                RcsbFvCoreBuilder.createFv({
                    elementId: elementId,
                    fvModuleI: RcsbFvGroup,
                    config: {group:GroupReference.UniprotEntityGroup, groupId: upAcc, additionalConfig: additionalConfig, resolve: resolve}
                });
            }catch(e) {
                reject(e);
            }
        });
    }
}