import {InterfaceInstanceTranslate} from "../RcsbUtils/Translators/InterfaceInstanceTranslate";
import {rcsbFvCtxManager} from "../RcsbFvWeb/RcsbFvBuilder/RcsbFvContextManager";

export class RcsbFvContextManager {

    static async getInterfaceToInstance(interfaceId:string): Promise<InterfaceInstanceTranslate>{
        return rcsbFvCtxManager.getInterfaceToInstance(interfaceId);
    }

}
