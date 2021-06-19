import {PolymerEntityInstanceInterface} from "../CollectTools/Translators/PolymerEntityInstancesCollector";

export class EntryAssemblyTranslate {
    private readonly rawData: Map<string,Array<PolymerEntityInstanceInterface>>;

    constructor(data: Map<string,Array<PolymerEntityInstanceInterface>>) {
        this.rawData = data;
    }

    getData(): Map<string,Array<PolymerEntityInstanceInterface>>{
        return this.rawData;
    }
}