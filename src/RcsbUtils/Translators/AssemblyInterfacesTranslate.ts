import {AssemblyInterfacesInterface} from "../../RcsbCollectTools/DataCollectors/AssemblyInterfacesCollector";

export class AssemblyInterfacesTranslate {

    private readonly rawData: Array<AssemblyInterfacesInterface>;
    private interfaceMap: Map<string,Array<string>> = new Map<string, Array<string>>();

    constructor(data: Array<AssemblyInterfacesInterface>) {
        this.rawData = data;
        data.forEach(d=>{
            this.interfaceMap.set(d.rcsbId, d.interfaceIds);
        })
    }

    getInterfaces(assemblyId: string): Array<string> | undefined{
        return this.interfaceMap.get(assemblyId);
    }

    getRawData(): Array<AssemblyInterfacesInterface>{
        return this.rawData;
    }

}