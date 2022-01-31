import {AssemblyInterfacesInterface} from "../../RcsbCollectTools/Translators/AssemblyInterfacesCollector";

export class AssemblyInterfacesTranslate {

    private readonly rawData: Array<AssemblyInterfacesInterface>;
    private interfaceMap: Map<string,Array<string>> = new Map<string, Array<string>>();

    constructor(data: Array<AssemblyInterfacesInterface>) {
        this.rawData = data;
        data.forEach(d=>{
            this.interfaceMap.set(d.rcsbId, d.interfaceIds);
        })
    }

    getInterfaces(assemblyId: string): Array<string>{
        return this.interfaceMap.get(assemblyId);
    }

}