import {QueryPolymer_EntitiesArgs} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";
import {PolymerEntityInstanceInterface} from "./PolymerEntityInstancesCollector";
import {MultipleEntityInstancesCollector} from "./MultipleEntityInstancesCollector";
import {TagDelimiter} from "@rcsb/rcsb-api-tools/build/RcsbUtils/TagDelimiter";

export interface PolymerEntityInterface {
    rcsbId: string;
    entityId: string;
    entryId: string;
    instances: PolymerEntityInstanceInterface[];
}

export class MultiplePolymerEntityCollector {

    private readonly multipleEntityInstanceCollector: MultipleEntityInstancesCollector = new MultipleEntityInstancesCollector();

    public async collect(requestConfig: QueryPolymer_EntitiesArgs): Promise<Array<PolymerEntityInterface>> {
        const results = await this.multipleEntityInstanceCollector.collect(requestConfig);
        const map: Map<string, PolymerEntityInstanceInterface[]> = new Map<string, PolymerEntityInstanceInterface[]>();
        results.forEach(r=>{
            if(!map.has(`${r.entryId}${TagDelimiter.entity}${r.entityId}`))
                map.set(`${r.entryId}${TagDelimiter.entity}${r.entityId}`, []);
            map.get(`${r.entryId}${TagDelimiter.entity}${r.entityId}`)?.push(r);
        });
        return Array.from(map.entries()).map(([k,v])=>({
            rcsbId: v[0].rcsbId,
            entityId: v[0].entityId,
            entryId: v[0].entryId,
            instances: v
        }));
    }

}