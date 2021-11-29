import {InterfaceInstanceInterface} from "../RcsbCollectTools/Translators/InterfaceInstanceCollector";

export class InterfaceInstanceTranslate {

    private readonly rawData: Array<InterfaceInstanceInterface>;
    private readonly instances: Map<string, [string,string]> = new Map<string, [string, string]>();

    constructor(data: Array<InterfaceInstanceInterface>) {
        this.rawData = data;
        data.forEach(d=>{
            this.instances.set(d.rcsbId, d.asymIds);
        })
    }

    getInstances(rcsbId: string):[string,string] {
        return this.instances.get(rcsbId);
    }
}