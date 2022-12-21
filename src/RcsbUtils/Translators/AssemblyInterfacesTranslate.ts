import {AssemblyInterfacesInterface} from "../../RcsbCollectTools/DataCollectors/AssemblyInterfacesCollector";

export class AssemblyInterfacesTranslate {

    private readonly rawData: AssemblyInterfacesInterface[];
    private interfaceMap: Map<string,string[]> = new Map<string, string[]>();

    constructor(data: AssemblyInterfacesInterface[]) {
        this.rawData = data;
        data.forEach(d=>{
            this.interfaceMap.set(d.rcsbId, d.interfaceIds);
        })
    }

    getInterfaces(assemblyId: string): string[]{
        return this.interfaceMap.get(assemblyId);
    }

}