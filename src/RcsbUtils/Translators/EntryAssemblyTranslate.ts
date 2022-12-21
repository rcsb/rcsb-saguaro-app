import {PolymerEntityInstanceInterface} from "../../RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";

export class EntryAssemblyTranslate {
    private readonly rawData: Map<string,PolymerEntityInstanceInterface[]>;

    constructor(data: Map<string,PolymerEntityInstanceInterface[]>) {
        this.rawData = data;
    }

    getData(): Map<string,PolymerEntityInstanceInterface[]>{
        return this.rawData;
    }
}