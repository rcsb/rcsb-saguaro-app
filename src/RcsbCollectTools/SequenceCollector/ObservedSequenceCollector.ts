import {
    AlignedRegion, AlignmentResponse,
    AnnotationFeatures,
    FieldName, FilterInput,
    OperationType,
    Source, Type
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    AlignedObservedRegion,
    SequenceCollector,
    SequenceCollectorDataInterface
} from "./SequenceCollector";
import {PolymerEntityInstanceTranslate, TranslateContextInterface} from "../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {MultipleEntityInstanceTranslate} from "../../RcsbUtils/Translators/MultipleEntityInstanceTranslate";
import {MultipleEntityInstancesCollector} from "../DataCollectors/MultipleEntityInstancesCollector";
import {TagDelimiter} from "../../RcsbUtils/Helpers/TagDelimiter";
import {rcsbClient, RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {
    AlignmentCollectConfig,
    SequenceCollectorInterface
} from "./SequenceCollectorInterface";
import {PolymerEntityInstanceInterface} from "../DataCollectors/PolymerEntityInstancesCollector";
import {Operator} from "../../RcsbUtils/Helpers/Operator";
import {ExternalTrackBuilderInterface} from "../FeatureTools/ExternalTrackBuilderInterface";

export class ObservedSequenceCollector implements SequenceCollectorInterface {

    private entityInstanceMap: MultipleEntityInstanceTranslate = new MultipleEntityInstanceTranslate();
    private unObservedMap: Map<string,Set<number>> = new Map<string, Set<number>>();
    private sequenceCollector: SequenceCollector = new SequenceCollector();
    readonly rcsbFvQuery: RcsbClient = rcsbClient;
    private polymerEntityInstanceTranslator:PolymerEntityInstanceTranslate;
    private externalTrackBuilder: ExternalTrackBuilderInterface;

    public async collect(requestConfig: AlignmentCollectConfig, filter?: Array<string>): Promise<SequenceCollectorDataInterface> {
        const annotationFeatures: Array<AnnotationFeatures> = await this.collectUnmodeledRegions(requestConfig);
        this.loadObservedRegions(annotationFeatures);
        return await this.sequenceCollector.collect(requestConfig, filter, this.collectEntityInstanceMap.bind(this), this.tagObservedRegions.bind(this));
    }

    public getTargets():Promise<Array<string>> {
        return this.sequenceCollector.getTargets();
    }

    public getAlignmentResponse():Promise<AlignmentResponse> {
        return this.sequenceCollector.getAlignmentResponse();
    }

    public getSequenceLength(): number{
        return this.sequenceCollector.getSequenceLength();
    }

    public getPolymerEntityInstanceTranslator(): PolymerEntityInstanceTranslate {
        return this.polymerEntityInstanceTranslator;
    }

    public setPolymerEntityInstanceTranslator(p: PolymerEntityInstanceTranslate): void {
        this.sequenceCollector.setPolymerEntityInstanceTranslator(p);
        this.polymerEntityInstanceTranslator = p;
    }

    public setExternalTrackBuilder(externalTrackBuilder: ExternalTrackBuilderInterface): void {
        this.sequenceCollector.setExternalTrackBuilder(externalTrackBuilder);
        this.externalTrackBuilder = externalTrackBuilder;
    }

    private loadObservedRegions(results : Array<AnnotationFeatures>){
        results.forEach(ann=>{
            ann.features.forEach(a=>{
                a.feature_positions.forEach(p=>{
                    this.addUnmodelled(ann.target_id,p.beg_seq_id,p.end_seq_id);
                })
            });
        });
    }

    private addUnmodelled(targetId: string, start: number, end: number, remove?: boolean){
        if(!this.unObservedMap.has(targetId))
            this.unObservedMap.set(targetId, new Set<number>());
        Array(end - start + 1).fill(0).map((n,i)=>{ return (start+i)}).forEach(n=>{
            if(remove && this.unObservedMap.get(targetId).has(n))
                this.unObservedMap.get(targetId).delete(n);
            else
                this.unObservedMap.get(targetId).add(n);
        });
    }

    private collectUnmodeledRegions(requestConfig: AlignmentCollectConfig): Promise<Array<AnnotationFeatures>>{
        const filters: FilterInput[] = [{
            field: FieldName.Type,
            operation: OperationType.Equals,
            source: Source.PdbInstance,
            values: [Type.UnobservedResidueXyz]
        }];
        const sources: Source[] = [Source.PdbInstance];
        if(requestConfig.group){
            return this.rcsbFvQuery.requestRcsbPdbGroupAnnotations({
                groupId: requestConfig.groupId,
                group: requestConfig.group,
                sources,
                filters
            });
        }else{
            return this.rcsbFvQuery.requestRcsbPdbAnnotations({
                queryId: requestConfig.queryId,
                reference: requestConfig.from,
                sources,
                filters
            });
        }
    }

    private tagObservedRegions(region: AlignedRegion, commonContext: TranslateContextInterface, noQuerySequenceFlag?:boolean): Array<AlignedObservedRegion>{
        if(this.entityInstanceMap.getEntity(commonContext.targetId)!=null){
            const asymIds: Array<string> = this.entityInstanceMap.getEntity(commonContext.targetId).translateEntityToAsym(commonContext.targetId.split(TagDelimiter.entity)[1]);
            const entryId: string = commonContext.targetId.split(TagDelimiter.entity)[0];
            const unModelled: Map<number,number> = new Map<number,number>();
            asymIds.forEach(id=>{
                if(this.unObservedMap.has(entryId+TagDelimiter.instance+id))
                    this.unObservedMap.get(entryId+TagDelimiter.instance+id).forEach(n=>{
                        if(n>=region.query_begin && n<=region.query_end)
                            if(!unModelled.has(n))
                                unModelled.set(n,1);
                            else
                                unModelled.set(n, unModelled.get(n)+1);
                    })
            });
            const unModelledList: Array<number> =  Array.from(unModelled.entries()).filter(a=>a[1]==asymIds.length).map(a=>a[0]).sort((a,b)=>a-b);
            if(unModelledList.length>0) {
                let begin: number = unModelledList.shift();
                let end: number = begin;
                let delta: number = region.target_begin-region.query_begin;
                const unModelledRegions: Array<AlignedObservedRegion> = new Array<AlignedObservedRegion>();
                if(unModelledList.length == 0)
                    unModelledRegions.push({
                        query_begin: begin,
                        query_end: end,
                        target_begin: begin+delta,
                        target_end: end+delta,
                        unModelled: true
                    });
                unModelledList.forEach((n, i) => {
                    if (n == end + 1) {
                        end = n;
                    } else {
                        unModelledRegions.push({
                            query_begin: begin,
                            query_end: end,
                            target_begin: begin+delta,
                            target_end: end+delta,
                            unModelled: true
                        });
                        begin = n;
                        end = n;
                        if(i==unModelledList.length-1)
                            unModelledRegions.push({
                                query_begin: begin,
                                query_end: end,
                                target_begin: begin+delta,
                                target_end: end+delta,
                                unModelled: true
                            });
                    }
                });
                if(end>begin)
                    unModelledRegions.push({
                        query_begin: begin,
                        query_end: end,
                        target_begin: begin+delta,
                        target_end: end+delta,
                        unModelled: true
                    });

                const outRegions: Array<AlignedObservedRegion> = new Array<AlignedObservedRegion>();
                if (region.query_begin < unModelledRegions[0].query_begin)
                    outRegions.push({
                        query_begin: region.query_begin,
                        query_end: (unModelledRegions[0].query_begin - 1),
                        target_begin: region.target_begin,
                        target_end: (unModelledRegions[0].target_begin - 1),
                        openBegin: false,
                        openEnd: false,
                        unModelled: false
                    });
                outRegions.push({...unModelledRegions.shift(), openBegin:false, openEnd:false});
                unModelledRegions.forEach((ur, i) => {
                    const n: number = outRegions.length - 1;
                    outRegions.push({
                        query_begin: outRegions[n].query_end + 1,
                        query_end: ur.query_begin - 1,
                        target_begin: outRegions[n].target_end + 1,
                        target_end: ur.target_begin - 1,
                        openBegin: false,
                        openEnd: false,
                        unModelled: false
                    });
                    outRegions.push({...ur, openBegin:false, openEnd:false});
                });
                const n: number = outRegions.length - 1;
                if (outRegions[n].query_end < region.query_end) {
                    outRegions.push({
                        query_begin: outRegions[n].query_end + 1,
                        query_end: region.query_end,
                        target_begin: outRegions[n].target_end + 1,
                        target_end: region.target_end,
                        openBegin: false,
                        openEnd: false,
                        unModelled:false
                    })
                }
                outRegions[0].openBegin = outRegions[0].target_begin != 1;
                outRegions[outRegions.length-1].openEnd = (outRegions[outRegions.length-1].target_end != commonContext.targetSequenceLength && !noQuerySequenceFlag);
                return outRegions;
            }
        }
        return [{...region,unModelled:false}];
    }

    private async collectEntityInstanceMap(entityIds: Array<string>): Promise<void>{
        const entityInstanceCollector: MultipleEntityInstancesCollector = new MultipleEntityInstancesCollector();
        const result: Array<Array<PolymerEntityInstanceInterface>> = await Promise.all<Array<PolymerEntityInstanceInterface>>(Operator.arrayChunk(entityIds, 100).map(ids => (entityInstanceCollector.collect({entity_ids:ids}))))
        result.forEach(r=>{
            this.entityInstanceMap.add(r);
        })
        return void 0;
    }

}
