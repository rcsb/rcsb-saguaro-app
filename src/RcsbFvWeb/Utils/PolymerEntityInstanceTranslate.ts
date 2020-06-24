import {PolymerEntityInstanceInterface} from "../CollectTools/EntryInstancesCollector";
import {RcsbFvTrackDataElementInterface} from "rcsb-saguaro";
import {SequenceReference, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {TagDelimiter} from "./TagDelimiter";

export interface TranslateContextInterface {
    queryId: string;
    targetId: string | null;
    from: SequenceReference;
    to: SequenceReference |Source | null;
}

export class PolymerEntityInstanceTranslate{
    private instanceAsymToAuth: Map<string,string> = new Map<string, string>();
    private instanceAuthToAsym: Map<string,string> = new Map<string, string>();
    private instanceAuthResIds: Map<string,Array<string>> = new Map<string, Array<string>>();
    private readonly INDEX_NAME: string = "auth";

    constructor(data: Array<PolymerEntityInstanceInterface>) {
        data.forEach(d=>{
            this.instanceAsymToAuth.set(d.asymId,d.authId);
            this.instanceAuthToAsym.set(d.authId,d.asymId);
            this.instanceAuthResIds.set(d.asymId,d.authResId);
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

    translateAuthResid(asymId:string, index:number): string{
        if(!this.instanceAuthResIds.has(asymId))
            return null;
        else if(index>this.instanceAuthResIds.get(asymId).length)
            return null;
        else if(this.instanceAuthResIds.get(asymId)[index-1])
            return null;
        else
            return this.instanceAuthResIds.get(asymId)[index-1];
    }

    addAuthorResIds(e:RcsbFvTrackDataElementInterface, alignmentContext:TranslateContextInterface):RcsbFvTrackDataElementInterface {
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