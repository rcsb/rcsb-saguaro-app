import {InterfaceInstanceInterface} from "../../RcsbCollectTools/DataCollectors/InterfaceInstanceCollector";

export class InterfaceInstanceTranslate {

    private readonly rawData: InterfaceInstanceInterface[];
    private readonly instances: Map<string, [string,string]> = new Map<string, [string, string]>();
    private readonly operatorsIds: Map<string,[string[][], string[][]]> = new Map<string, [string[][], string[][]]>();

    constructor(data: InterfaceInstanceInterface[]) {
        this.rawData = data;
        data.forEach(d=>{
            this.instances.set(d.rcsbId, d.asymIds);
            this.operatorsIds.set(d.rcsbId, d.operatorIds);
        })
    }

    getInstances(rcsbId: string):[string,string] {
        return this.instances.get(rcsbId);
    }

    getOperatorIds(rcsbId: string): [string[][], string[][]] {
        return this.operatorsIds.get(rcsbId);
    }
}