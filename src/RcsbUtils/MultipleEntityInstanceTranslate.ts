import {PolymerEntityInstanceTranslate} from "./PolymerEntityInstanceTranslate";
import {PolymerEntityInstanceInterface} from "../RcsbCollectTools/Translators/PolymerEntityInstancesCollector";
import {TagDelimiter} from "./TagDelimiter";
import {Operator} from "../Helpers/Operator";

export class MultipleEntityInstanceTranslate {

    private readonly entityInstanceTranslateMap: Map<string, PolymerEntityInstanceTranslate> = new Map<string, PolymerEntityInstanceTranslate>();

    public add(data: Array<PolymerEntityInstanceInterface>) {
        const entryEntityInstanceMapList: Map<string, Array<PolymerEntityInstanceInterface>> = new Map<string, Array<PolymerEntityInstanceInterface>>();
        data.forEach(d=>{
            const entityId: string = d.entryId+TagDelimiter.entity+d.entityId;
            if(!entryEntityInstanceMapList.has(entityId))
                entryEntityInstanceMapList.set(entityId, new Array<PolymerEntityInstanceInterface>())
            entryEntityInstanceMapList.get(entityId).push(d);
        });
        entryEntityInstanceMapList.forEach((v,entityId)=>{
            this.entityInstanceTranslateMap.set(entityId, new PolymerEntityInstanceTranslate(v));
        });
    }

    public getEntity(entityId: string): PolymerEntityInstanceTranslate{
        return this.entityInstanceTranslateMap.get(entityId);
    }

    public getEntities(): Array<string>{
        return Array.from<string>(this.entityInstanceTranslateMap.keys());
    }

    public getEntries(): Array<string>{
        return Operator.uniqueValues<string>(
            Array.from<string>(this.entityInstanceTranslateMap.keys()).map(entityId=>entityId.split(TagDelimiter.entity)[0])
        );
    }

    public getInstances(): Array<string>{
        return Operator.uniqueValues<string>(
            Array.from<PolymerEntityInstanceTranslate>(this.entityInstanceTranslateMap.values()).map(peit=>peit.getData()).flat().map(e => e.asymId)
        );
    }



}