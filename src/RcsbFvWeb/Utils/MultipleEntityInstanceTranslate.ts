import {PolymerEntityInstanceTranslate} from "./PolymerEntityInstanceTranslate";
import {PolymerEntityInstanceInterface} from "../CollectTools/EntryInstancesCollector";

export class MultipleEntityInstanceTranslate {

    private entryEntityInstanceTranslateMap: Map<string, PolymerEntityInstanceTranslate> = new Map<string, PolymerEntityInstanceTranslate>();

    public add(data: Array<PolymerEntityInstanceInterface>) {
        data.forEach(d=>{
            if(!this.entryEntityInstanceTranslateMap.has(d.rcsbId)) {
                this.entryEntityInstanceTranslateMap.set(d.rcsbId, new PolymerEntityInstanceTranslate([d]) );
            }
        });

    }

    public get(asymId: string): PolymerEntityInstanceTranslate{
        return this.entryEntityInstanceTranslateMap.get(asymId);
    }

}