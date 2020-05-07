import {PolymerEntityInstanceInterface} from "../CollectTools/EntryInstancesCollector";

export class PolymerEntityInstance{
    private instanceAsymToAuth: Map<string,string> = new Map<string, string>();
    private instanceAuthToAsym: Map<string,string> = new Map<string, string>();

    constructor(data: Array<PolymerEntityInstanceInterface>) {
        data.forEach(d=>{
            this.instanceAsymToAuth.set(d.asymId,d.authId);
            this.instanceAuthToAsym.set(d.authId,d.asymId);
        });
    }

    translateAsymToAuth(id: string): string{
        if(this.instanceAsymToAuth.has(id))
            return this.instanceAsymToAuth.get(id);
        return null;
    }

    translateAuthToAsym(id: string): string{
        if(this.instanceAuthToAsym.has(id))
            return this.instanceAuthToAsym.get(id);
        return null;
    }
}