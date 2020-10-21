import {AlignmentResponse, QueryAlignmentArgs, SequenceReference} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvQuery} from "../../RcsbGraphQL/RcsbFvQuery";

export class GenomeEntityTranslate {

    entityMap: Map<string, Array<string>> = new Map<string, Array<string>>();
    finished: boolean = false;

    constructor( entityIds: Array<string>) {
        Promise.all(entityIds.map(e=>{
            return GenomeEntityTranslate.entityChromosomes(e)
        })).then(result=>{
            result.forEach((alignment,n)=>{
                alignment.target_alignment?.forEach(ta=>{
                    if(ta.aligned_regions.length>0){
                        if(!this.entityMap.has(entityIds[n]))
                            this.entityMap.set(entityIds[n],new Array<string>());
                        this.entityMap.get(entityIds[n]).push(ta.target_id);
                    }

                })
            });
            this.finished = true;
        })
    }

    getChrMap(): Promise<Map<string, Array<string>>>{
        return new Promise<Map<string, Array<string>>>( (resolve,reject)=>{
            const recursive = ()=>{
                if(this.finished){
                    resolve(this.entityMap);
                }else{
                    setTimeout(()=>{
                        recursive();
                    },1000)
                }
            }
            recursive();
        })
    }

    private static entityChromosomes(entityId: string): Promise<AlignmentResponse>{
        const request: QueryAlignmentArgs = {
            from: SequenceReference.PdbEntity,
            to: SequenceReference.NcbiGenome,
            queryId: entityId
        };
        const rcsbFvQuery: RcsbFvQuery = new RcsbFvQuery();
        return rcsbFvQuery.requestAlignment(request);
    }
}