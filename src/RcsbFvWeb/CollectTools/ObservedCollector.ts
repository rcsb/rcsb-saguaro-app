import {
    AlignedRegion,
    AnnotationFeatures, Feature,
    FieldName,
    OperationType,
    SequenceReference,
    Source, TargetAlignment
} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    AlignedObservedRegion, BuildAlignementsInterface,
    CollectAlignmentInterface,
    SequenceCollector,
    SequenceCollectorDataInterface
} from "./SequenceCollector";
import {TranslateContextInterface} from "../Utils/PolymerEntityInstanceTranslate";
import {RcsbFvLink, RcsbFvRowConfigInterface, RcsbFvTrackDataElementInterface} from "@bioinsilico/rcsb-saguaro";
import {TagDelimiter} from "../Utils/TagDelimiter";
import * as resource from "../../../web.resources.json";
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {MultipleEntityInstanceTranslate} from "../Utils/MultipleEntityInstanceTranslate";
import {MultipleEntityInstancesCollector} from "./MultipleEntityInstancesCollector";

export class ObservedSequenceCollector extends SequenceCollector{

    private entityInstanceMap: MultipleEntityInstanceTranslate = new MultipleEntityInstanceTranslate();
    private unobservedIntervalsHashMap: Map<string,string> = new Map<string, string>();
    private entityTargets: Set<string> = new Set<string>();
    private unObservedMap: Map<string,Array<AlignedRegion>> = new Map<string, Array<AlignedRegion>>();

    public collect(requestConfig: CollectAlignmentInterface): Promise<SequenceCollectorDataInterface> {
        return this.collectObservedRegions(requestConfig.queryId, requestConfig.from).then(result=> {
            this.loadObservedRegions(result);
            return super.collect(requestConfig, this.collectEntityInstanceMap.bind(this));
        });
    }

    private loadObservedRegions(results : Array<AnnotationFeatures>){
        results.forEach(ann=>{
            this.unObservedMap.set(ann.target_id, new Array<AlignedRegion>());
            ann.features.forEach(a=>{
                a.feature_positions.forEach(p=>{
                    this.unObservedMap.get(ann.target_id).push({
                        query_begin:p.beg_seq_id,
                        query_end:p.end_seq_id,
                        target_begin:p.beg_ori_id,
                        target_end:p.end_ori_id
                    });
                })
            });
        })
    }

    private collectObservedRegions(queryId: string, reference: SequenceReference): Promise<Array<AnnotationFeatures>>{
        return this.rcsbFvQuery.requestRcsbPdbAnnotations({
            queryId: queryId,
            reference: reference,
            sources: [Source.PdbInstance],
            filters: [{
                field:FieldName.Type,
                operation:OperationType.Equals,
                source:Source.PdbInstance,
                values:["UNOBSERVED_RESIDUE_XYZ"]
            }]
        });
    }

    protected tagObservedRegions(region: AlignedRegion, commonContext: TranslateContextInterface): Array<AlignedObservedRegion>{
        this.unobservedIntervalsHashMap.set(commonContext.targetId, "null");
        if( !this.unObservedMap.has(commonContext.targetId) )
            return [region];
        const unobserved: Array<AlignedRegion> = this.unObservedMap.get(commonContext.targetId);
        const unobservedIntervalsHash: Array<string> = new Array<string>();
        const points: Array<{q:number; t:number;}> = new Array<{q: number; t: number;}>();
        points.push({q:region.query_begin,t:region.target_begin});
        unobserved.sort((a,b)=>{return (a.query_begin-b.query_begin)}).forEach(u=>{
            if(!unobservedIntervalsHash.includes(u.query_begin+"."+u.query_end)) {
                unobservedIntervalsHash.push(u.query_begin + "." + u.query_end);
                if (points[points.length - 1].q != u.query_begin) {
                    points.push({q: u.query_begin, t: u.target_begin});
                }
                points.push({q: u.query_end, t: u.target_end});
            }
        });
        this.unobservedIntervalsHashMap.set(commonContext.targetId, unobservedIntervalsHash.join(":"));
        if(points[points.length-1].q != region.query_end){
            points.push({q:region.query_end,t:region.target_end});
        }
        const out: Array<AlignedObservedRegion> = new Array<AlignedObservedRegion>();
        for(let n=0;n<points.length-1;n++){
            if(unobservedIntervalsHash.includes(points[n].q+"."+points[n+1].q)){
                out.push({
                    query_begin:points[n].q,
                    target_begin:points[n].t,
                    query_end:points[n+1].q ,
                    target_end:points[n+1].t,
                    unobserved: true,
                    openBegin: false,
                    openEnd: false
                });
            }else{
                out.push({
                    query_begin: n == 0 ? points[n].q : points[n].q+1,
                    target_begin: n == 0 ? points[n].t : points[n].t+1,
                    query_end: n+1 == points.length-1 ? points[n+1].q : points[n+1].q-1,
                    target_end: n+1 == points.length-1 ? points[n+1].t : points[n+1].t-1,
                    unobserved: false,
                    openBegin: false,
                    openEnd: false
                });
            }

        }
        out[0].openBegin = out[0].target_begin != 1;
        out[out.length-1].openEnd = out[out.length-1].target_end != commonContext.targetSequenceLength;
        return out;
    }

    private collectEntityInstanceMap(instanceIds: Array<string>): Promise<null>{
        const entityInstanceCollector: MultipleEntityInstancesCollector = new MultipleEntityInstancesCollector();
        return entityInstanceCollector.collect({
            instance_ids:instanceIds
        }).then(result=>{
            console.log(result);
            this.entityInstanceMap.add(result);
            return null;
        });
    }

    protected buildAlignmentRowTitle(targetAlignment: TargetAlignment, alignmentData: BuildAlignementsInterface ): string | RcsbFvLink {
        let rowTitle: string | RcsbFvLink;
        if (alignmentData.to === SequenceReference.PdbInstance && this.entityInstanceMap.get(targetAlignment.target_id) != null) {
            const pdbId: string = targetAlignment.target_id.split(TagDelimiter.instance)[0];
            const entityId: string = this.entityInstanceMap.get(targetAlignment.target_id).translateAsymToEntity(targetAlignment.target_id.split(TagDelimiter.instance)[1]);
            const authId:string  = this.entityInstanceMap.get(targetAlignment.target_id).translateAsymToAuth(targetAlignment.target_id.split(TagDelimiter.instance)[1]);
            rowTitle = {
                visibleTex:pdbId + TagDelimiter.entity + entityId + TagDelimiter.instance + authId,
                url:(resource as any).rcsb_entry.url+targetAlignment.target_id.split(TagDelimiter.instance)[0]+"#entity-"+entityId,
                style: {
                    fontWeight:"bold",
                    color:RcsbAnnotationConstants.provenanceColorCode.rcsbPdb
                }
            };
            this.entityTargets.add(pdbId + TagDelimiter.entity + entityId);
        } else {
            rowTitle = super.buildAlignmentRowTitle(targetAlignment, alignmentData);
        }
        return rowTitle;
    }

    protected filterAlignments(): Array<RcsbFvRowConfigInterface>{
        const trackMap: Map<string,Map<string,string>> = new Map<string, Map<string,string>>();
        const trackTragetIds: Array<string> = new Array<string>();
        this.alignmentsConfigData.forEach((track,targetId)=>{
            const pdbId: string = targetId.split(TagDelimiter.instance)[0];
            const entityId: string = this.entityInstanceMap.get(targetId).translateAsymToEntity(targetId.split(TagDelimiter.instance)[1]);
            const unobservedHash: string = this.unobservedIntervalsHashMap.get(targetId);
            if(!trackMap.has(pdbId + TagDelimiter.entity + entityId))
                trackMap.set(pdbId + TagDelimiter.entity + entityId, new Map<string, string>());
            if(!trackMap.get(pdbId + TagDelimiter.entity + entityId).has(unobservedHash)) {
                trackMap.get(pdbId + TagDelimiter.entity + entityId).set(unobservedHash, targetId);
                trackTragetIds.push(targetId);
            }
        })
        return Array.from(this.alignmentsConfigData.entries()).filter(a=>{return trackTragetIds.includes(a[0]);}).sort((a,b)=>{
            return a[0].localeCompare(b[0]);
        }).map(a=>{return a[1]});
    }

    protected addAuthorResIds(e:RcsbFvTrackDataElementInterface, alignmentContext:TranslateContextInterface):RcsbFvTrackDataElementInterface {
        let o:RcsbFvTrackDataElementInterface = e;
        if(this.entityInstanceMap.get(alignmentContext.targetId)!=null){
            this.entityInstanceMap.get(alignmentContext.targetId).addAuthorResIds(o,alignmentContext);
            const pdbId: string = alignmentContext.targetId.split(TagDelimiter.instance)[0];
            const entityId: string = this.entityInstanceMap.get(alignmentContext.targetId).translateAsymToEntity(alignmentContext.targetId.split(TagDelimiter.instance)[1]);
            const authId:string  = this.entityInstanceMap.get(alignmentContext.targetId).translateAsymToAuth(alignmentContext.targetId.split(TagDelimiter.instance)[1]);
            o.sourceId = pdbId + TagDelimiter.entity + entityId + TagDelimiter.instance + authId;
        }
        return o;
    }

    getTargets(): Promise<Array<string>>{
        return new Promise<Array<string>>((resolve,reject)=>{
            const recursive:()=>void = ()=>{
                if(this.finished){
                    resolve(Array.from(this.entityTargets));
                }else{
                    if(typeof window!== "undefined") {
                        window.setTimeout(() => {
                            recursive();
                        }, 1000);
                    }
                }
            };
            recursive();
        });
    }
}
