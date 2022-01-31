import {PolymerEntityInstanceInterface} from "../../RcsbCollectTools/Translators/PolymerEntityInstancesCollector";
import {RcsbFvTrackDataElementInterface} from '@rcsb/rcsb-saguaro';
import {SequenceReference, Source} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {TagDelimiter} from "../TagDelimiter";

export interface TranslateContextInterface {
    queryId: string;
    targetId: string;
    from: SequenceReference | undefined;
    to: SequenceReference|Source;
    targetSequenceLength?: number;
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
            this.entityToAsym.get(d.entityId).add(d.asymId);
        });
    }

    public getData(): Array<PolymerEntityInstanceInterface>{
        return this.rawData;
    }

    public translateEntityToAsym(id: string): Array<string>{
        if(this.entityToAsym.has(id))
            return Array.from( this.entityToAsym.get(id) );
        return null;
    }

    public translateAsymToEntity(id: string): string{
        if(this.instanceAsymToEntity.has(id))
            return this.instanceAsymToEntity.get(id);
        return null;
    }

    public translateAsymToAuth(id: string): string{
        if(this.instanceAsymToAuth.has(id))
            return this.instanceAsymToAuth.get(id);
        return null;
    }

    public translateAuthToAsym(id: string): string{
        if(this.instanceAuthToAsym.has(id))
            return this.instanceAuthToAsym.get(id);
        return null;
    }

    public translateAuthResId(asymId:string, index:number): string{
        if(!this.instanceAuthResIds.has(asymId))
            return null;
        else if(index>this.instanceAuthResIds.get(asymId).length)
            return null;
        else if(this.instanceAuthResIds.get(asymId)[index-1])
            return null;
        else
            return this.instanceAuthResIds.get(asymId)[index-1];
    }

    public addAuthorResIds(e:RcsbFvTrackDataElementInterface, alignmentContext:TranslateContextInterface):RcsbFvTrackDataElementInterface {
        let o:RcsbFvTrackDataElementInterface = e;
        if(alignmentContext.from === SequenceReference.PdbInstance) {
            const asymId: string = alignmentContext.queryId.split(TagDelimiter.instance)[1];
            this.helperAddAuthorResIds(o,alignmentContext.from,alignmentContext.to,asymId);
            o.indexName = this.INDEX_NAME;
        }else if(alignmentContext.to === SequenceReference.PdbInstance){
            const asymId: string = alignmentContext.targetId.split(TagDelimiter.instance)[1];
            this.helperAddAuthorResIds(o,alignmentContext.from,alignmentContext.to,asymId);
            o.indexName = this.INDEX_NAME;
        }
        return o;
    }

    private helperAddAuthorResIds(e: RcsbFvTrackDataElementInterface, reference:string, source:string, asymId: string):RcsbFvTrackDataElementInterface{
        let out: RcsbFvTrackDataElementInterface = e;
        if( reference === SequenceReference.PdbInstance || (reference === SequenceReference.PdbEntity && source === Source.PdbInstance) ) {
            const x:string = this.instanceAuthResIds.get(asymId)[e.begin-1];
            if (typeof e.end === "number" && this.instanceAuthResIds.get(asymId)[e.end-1] != x){
                out.beginName = x;
                out.endName = this.instanceAuthResIds.get(asymId)[e.end-1];
            }else if(typeof e.end != "number" || this.instanceAuthResIds.get(asymId)[e.end-1] == x){
                out.beginName = x;
            }
        }else if( source === Source.PdbInstance ){
            const x:string = this.instanceAuthResIds.get(asymId)[e.oriBegin-1];
            if(typeof e.oriEnd === "number" && this.instanceAuthResIds.get(asymId)[e.oriEnd-1] != x){
                out.oriBeginName = x;
                out.oriEndName = this.instanceAuthResIds.get(asymId)[e.oriEnd-1];
            }else if(typeof e.oriEnd != "number" || this.instanceAuthResIds.get(asymId)[e.oriEnd-1] == x){
                out.oriBeginName = x;
            }
        }
        return out;
    }
}