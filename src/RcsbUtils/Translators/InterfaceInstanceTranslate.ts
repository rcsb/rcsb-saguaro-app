import {InterfaceInstanceInterface} from "../../RcsbCollectTools/DataCollectors/InterfaceInstanceCollector";

export class InterfaceInstanceTranslate {

    private readonly rawData: Array<InterfaceInstanceInterface>;
    private readonly instances: Map<string, [string,string]> = new Map<string, [string, string]>();
    private readonly operatorsIds: Map<string,[Array<Array<string>>, Array<Array<string>>]> = new Map<string, [Array<Array<string>>, Array<Array<string>>]>();

    constructor(data: Array<InterfaceInstanceInterface>) {
        this.rawData = data;
        data.forEach(d=>{
            this.instances.set(d.rcsbId, d.asymIds);
            this.operatorsIds.set(d.rcsbId, d.operatorIds);
        })
    }

    getInstances(rcsbId: string):[string,string] | undefined{
        return this.instances.get(rcsbId);
    }

    getOperatorIds(rcsbId: string): [Array<Array<string>>, Array<Array<string>>] | undefined {
        return this.operatorsIds.get(rcsbId);
    }

    getRawData(): Array<InterfaceInstanceInterface>{
        return this.rawData;
    }

}