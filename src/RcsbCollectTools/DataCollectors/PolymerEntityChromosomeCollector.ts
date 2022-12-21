import {AlignmentResponse, QueryAlignmentArgs, SequenceReference} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {rcsbClient, RcsbClient} from "../../RcsbGraphQL/RcsbClient";

export class PolymerEntityChromosomeCollector {

    private readonly rcsbFvQuery: RcsbClient = rcsbClient;

    public async collect( entityIds: string[]): Promise<Map<string, string[]>> {
        const entityMap: Map<string, string[]> = new Map<string, string[]>();
        const result = await Promise.all(entityIds.map(e=>{
            return this.entityChromosomes(e);
        }));
        result.forEach((alignment,n)=>{
            alignment.target_alignment?.forEach(ta=>{
                if(ta.aligned_regions.length>0){
                    if(!entityMap.has(entityIds[n]))
                        entityMap.set(entityIds[n],new Array<string>());
                    entityMap.get(entityIds[n]).push(ta.target_id);
                }

            })
        });
        return entityMap;
    }

    private async entityChromosomes(entityId: string): Promise<AlignmentResponse>{
        const request: QueryAlignmentArgs = {
            from: SequenceReference.PdbEntity,
            to: SequenceReference.NcbiGenome,
            queryId: entityId
        };
        return await this.rcsbFvQuery.requestAlignment(request);
    }

}