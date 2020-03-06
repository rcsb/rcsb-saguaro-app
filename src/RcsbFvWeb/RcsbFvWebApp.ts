import {
    RcsbFv,
    RcsbFvBoardConfigInterface,
    RcsbFvInterface,
} from 'rcsb-saguaro';

import {
    Source,
} from "../RcsbGraphQL/Types/GqlTypes";
import {RcsbFvEntity} from "./RcsbFvModule/RcsbFvEntity";
import {RcsbFvInstance} from "./RcsbFvModule/RcsbFvInstance";
import {RcsbFvUniprot} from "./RcsbFvModule/RcsbFvUniprot";

export class RcsbFvWebApp {
    private rcsbFv: RcsbFv;
    private boardConfigData: RcsbFvBoardConfigInterface;

    constructor(config: RcsbFvBoardConfigInterface) {
        this.rcsbFv = new RcsbFv({
            rowConfigData: null,
            boardConfigData: null,
            elementId: config.elementId
        } as RcsbFvInterface);
        this.boardConfigData = config;
    }

    public buildUniprotFv(upAcc: string): void {
        const rcsbFvUniprot:RcsbFvUniprot = new RcsbFvUniprot(this.boardConfigData);
        rcsbFvUniprot.build(upAcc);
    }

    public buildEntityFv(entityId: string, uniprot?: Source): void {
        const rcsbFvEntity:RcsbFvEntity = new RcsbFvEntity(this.boardConfigData);
        rcsbFvEntity.build(entityId, uniprot);
    }

    public buildInstanceFv(instanceId: string): void {
        const rcsbFvInstance:RcsbFvInstance = new RcsbFvInstance(this.boardConfigData);
        rcsbFvInstance.build(instanceId);
    }

}

