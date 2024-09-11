import {PolymerEntityInstanceInterface} from "../../RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";
import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro/lib/RcsbDataManager/RcsbDataManager";
import {SequenceReference, AnnotationReference} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {TagDelimiter} from "@rcsb/rcsb-api-tools/build/RcsbUtils/TagDelimiter";
import {
    RcsbFvTrackDataAnnotationInterface
} from "../../RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/RcsbFvTrackDataAnnotationInterface";

export interface AlignmentContextInterface {
    queryId: string;
    targetId: string;
    from: SequenceReference | undefined;
    to: SequenceReference|AnnotationReference|undefined;
    targetSequenceLength?: number;
    querySequenceLength?: number;
}

export class PolymerEntityInstanceTranslate{
    private readonly rawData: Array<PolymerEntityInstanceInterface>;
    private readonly instanceAsymToAuth: Map<string,string> = new Map<string, string>();
    private readonly instanceAuthToAsym: Map<string,string> = new Map<string, string>();
    private readonly instanceAsymToEntity: Map<string,string> = new Map<string, string>();
    private readonly entityToAsym: Map<string,Set<string>> = new Map<string, Set<string>>();
    private readonly instanceAuthResIds: Map<string,Array<string>> = new Map<string, Array<string>>();
    private readonly INDEX_NAME: string = "auth";

    constructor(data: Array<PolymerEntityInstanceInterface>) {
        this.rawData = data;
        data.forEach(d=>{
            this.instanceAsymToAuth.set(d.asymId,d.authId);
            this.instanceAuthToAsym.set(d.authId,d.asymId);
            this.instanceAuthResIds.set(d.asymId,d.authResId);
            this.instanceAsymToEntity.set(d.asymId,d.entityId);
            if(!this.entityToAsym.has(d.entityId))
                this.entityToAsym.set(d.entityId, new Set<string>());
            this.entityToAsym.get(d.entityId)?.add(d.asymId);
        });
    }

    public getData(): Array<PolymerEntityInstanceInterface>{
        return this.rawData;
    }

    public translateEntityToAsym(id: string): string[] | undefined {
        const asymIds: Set<string> | undefined = this.entityToAsym.get(id);
        if(asymIds)
            return Array.from(asymIds);
    }

    public translateAsymToEntity(id: string): string | undefined {
        return this.instanceAsymToEntity.get(id);
    }

    public translateAsymToAuth(id: string): string | undefined {
        return this.instanceAsymToAuth.get(id);
    }

    public translateAuthToAsym(id: string): string | undefined{
        return this.instanceAuthToAsym.get(id);
    }

    public translateAuthResId(asymId:string, index:number): string | undefined {
        const autReaIds: string[] | undefined =  this.instanceAuthResIds.get(asymId);
        if(!autReaIds)
            return undefined;
        else if(index > autReaIds.length)
            return undefined;
        else if(autReaIds[index-1])
            return undefined;
        else
            return autReaIds[index-1];
    }

    public addAuthorResIds(e:RcsbFvTrackDataElementInterface, alignmentContext:AlignmentContextInterface):RcsbFvTrackDataElementInterface {
        let o:RcsbFvTrackDataAnnotationInterface = e;
        if(alignmentContext.from === SequenceReference.PdbInstance && alignmentContext.to) {
            const asymId: string = alignmentContext.queryId.split(TagDelimiter.instance)[1];
            this.helperAddAuthorResIds(o,alignmentContext.from,alignmentContext.to,asymId);
            o.indexName = this.INDEX_NAME;
        }else if(alignmentContext.to === SequenceReference.PdbInstance && alignmentContext.from){
            const asymId: string = alignmentContext.targetId.split(TagDelimiter.instance)[1];
            this.helperAddAuthorResIds(o,alignmentContext.from,alignmentContext.to,asymId);
            o.indexName = this.INDEX_NAME;
        }
        return o;
    }

    private helperAddAuthorResIds(e: RcsbFvTrackDataAnnotationInterface, reference:string, source:string, asymId: string):RcsbFvTrackDataElementInterface{
        let out: RcsbFvTrackDataAnnotationInterface = e;
        const authResIds: string[] | undefined = this.instanceAuthResIds.get(asymId);
        if(!authResIds)
            return out;
        if( reference === SequenceReference.PdbInstance || (reference === SequenceReference.PdbEntity && source === AnnotationReference.PdbInstance) ) {
            const x:string = authResIds[e.begin-1];
            if (typeof e.end === "number" && authResIds[e.end-1] != x){
                out.beginName = x;
                out.endName = authResIds[e.end-1];
            }else if(typeof e.end != "number" || authResIds[e.end-1] == x){
                out.beginName = x;
            }
        }else if( source === AnnotationReference.PdbInstance  && e.oriBegin){
            const x:string = authResIds[e.oriBegin-1];
            if(typeof e.oriEnd === "number" && authResIds[e.oriEnd-1] != x){
                out.oriBeginName = x;
                out.oriEndName =authResIds[e.oriEnd-1];
            }else if(typeof e.oriEnd != "number" || authResIds[e.oriEnd-1] == x){
                out.oriBeginName = x;
            }
        }
        return out;
    }
}