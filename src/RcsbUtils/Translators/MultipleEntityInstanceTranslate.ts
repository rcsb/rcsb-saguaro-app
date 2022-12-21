import {PolymerEntityInstanceTranslate} from "./PolymerEntityInstanceTranslate";
import {PolymerEntityInstanceInterface} from "../../RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";
import {TagDelimiter} from "../Helpers/TagDelimiter";
import {Operator} from "../Helpers/Operator";

export class MultipleEntityInstanceTranslate {

    private readonly entityInstanceTranslateMap: Map<string, PolymerEntityInstanceTranslate> = new Map<string, PolymerEntityInstanceTranslate>();

    public add(data: PolymerEntityInstanceInterface[]) {
        const entryEntityInstanceMapList: Map<string, PolymerEntityInstanceInterface[]> = new Map<string, PolymerEntityInstanceInterface[]>();
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

    public getEntities(): string[]{
        return Array.from<string>(this.entityInstanceTranslateMap.keys());
    }

    public getEntries(): string[]{
        return Operator.uniqueValues<string>(
            Array.from<string>(this.entityInstanceTranslateMap.keys()).map(entityId=>TagDelimiter.parseEntity(entityId).entryId)
        );
    }

    public getInstances(): string[]{
        return Operator.uniqueValues<string>(
            Array.from<PolymerEntityInstanceTranslate>(this.entityInstanceTranslateMap.values()).map(peit=>peit.getData()).flat().map(e => e.asymId)
        );
    }



}