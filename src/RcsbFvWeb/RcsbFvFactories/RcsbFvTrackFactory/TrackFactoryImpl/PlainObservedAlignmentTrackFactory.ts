import {
    AlignedRegion,
    AnnotationFeatures,
    TargetAlignment
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    PolymerEntityInstanceTranslate,
    AlignmentContextInterface
} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {TagDelimiter} from "../../../../RcsbUtils/Helpers/TagDelimiter";
import {TrackFactoryInterface} from "../TrackFactoryInterface";
import {RcsbFvRowConfigInterface, RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {AlignmentRequestContextType, AlignmentTrackFactory} from "./AlignmentTrackFactory";
import {RcsbAnnotationConstants} from "../../../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {Operator} from "../../../../RcsbUtils/Helpers/Operator";

import {
    EntryPropertyIntreface,
    MultipleEntryPropertyCollector
} from "../../../../RcsbCollectTools/DataCollectors/MultipleEntryPropertyCollector";
import {range} from "lodash";
import {PlainAlignmentTrackFactory} from "./PlainAlignmentTrackFactory";

interface AlignedObservedRegion extends AlignedRegion {
    unModelled?:boolean;
    openBegin?:boolean;
    openEnd?:boolean;
}

export class PlainObservedAlignmentTrackFactory implements TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment]>{

    private alignmentTrackFactory: PlainAlignmentTrackFactory;
    private unObservedResidues: Map<string,Array<number>> = new Map<string, Array<number>>();

    private readonly instanceEntityMap: Map<string,string> = new Map<string, string>();
    private readonly entityInstanceNumberMap: Map<string,number> = new Map<string, number>();

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate) {
        this.alignmentTrackFactory = new PlainAlignmentTrackFactory(entityInstanceTranslator);
    }

    public async getTrack(alignmentRequestContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<RcsbFvRowConfigInterface> {
        return this.alignmentTrackFactory.getTrack(alignmentRequestContext, targetAlignment, this.alignedRegionToTrackElementList.bind(this));
    }

    public async prepareFeatures(unObservedRegions: Array<AnnotationFeatures>): Promise<void>{
        await this.collectFeatureEntryProperties(unObservedRegions);
        this.prepareFeaturesAlignmentMap(unObservedRegions);
    }

    private async collectFeatureEntryProperties(unObservedRegions: Array<AnnotationFeatures>): Promise<void>{
        const entryIds: string[] = Operator.uniqueValues<string>(unObservedRegions.map(uor=>uor.target_id.split(TagDelimiter.instance)[0]));
        const entryPropertyCollector = new MultipleEntryPropertyCollector();
        //TODO define a Translator class for multiple entry entry data
        const entryProperties: EntryPropertyIntreface[] = (await Promise.all<EntryPropertyIntreface[]>(Operator.arrayChunk(entryIds, 100).map(ids => entryPropertyCollector.collect({entry_ids:ids})))).flat();
        entryProperties.forEach(ep=>{
            ep.entityToInstance.forEach((instanceList,entityId)=>{
                this.entityInstanceNumberMap.set(entityId, instanceList.length);
                instanceList.forEach(instanceId=>{
                    this.instanceEntityMap.set(instanceId,entityId);
                })
            });
        });
    }

    private prepareFeaturesAlignmentMap(unObservedRegions: Array<AnnotationFeatures>){
        const uoInstanceFeatureMap: Map<string,Set<number>> = new Map<string, Set<number>>();
        unObservedRegions.forEach(ur=> {
            const instanceId: string = ur.target_id;
            if(!uoInstanceFeatureMap.has(instanceId))
                uoInstanceFeatureMap.set(instanceId, new Set<number>())
            ur.features.forEach(feature=>{
                feature.feature_positions.forEach(fp=>{
                    for(let i=fp.beg_seq_id;i<=fp.end_seq_id;i++){
                        uoInstanceFeatureMap.get(instanceId).add(i);
                    }
                });
            });
        });
        const uoEntityFeatureMap: Map<string,Map<number,number>> = new Map<string, Map<number,number>>();
        uoInstanceFeatureMap.forEach((uoSet,instanceId)=>{
            const entityId: string = this.instanceEntityMap.get(instanceId);
            if(!uoEntityFeatureMap.has(entityId))
                uoEntityFeatureMap.set(entityId, new Map<number, number>());

            uoSet.forEach(i=>{
                if(uoEntityFeatureMap.get(entityId).has(i)){
                    uoEntityFeatureMap.get(entityId).set(i,uoEntityFeatureMap.get(entityId).get(i)+1);
                }else{
                    uoEntityFeatureMap.get(entityId).set(i,1);
                }
            });
        });
        uoEntityFeatureMap.forEach((unObservedMap,entityId)=>{
            this.unObservedResidues.set(entityId, Array.from(unObservedMap.entries()).filter(e=>(e[1]==this.entityInstanceNumberMap.get(entityId))).map(e=>e[0]).sort((a,b)=>a-b));
        })
    }

    private alignedRegionToTrackElementList(region: AlignedRegion, alignmentContext: AlignmentContextInterface): Array<RcsbFvTrackDataElementInterface>{
        if(!this.unObservedResidues.has(alignmentContext.targetId) || this.unObservedResidues.get(alignmentContext.targetId).length == 0)
            return this.alignmentTrackFactory.alignedRegionToTrackElementList(region, alignmentContext);
        const outRegions: Array<AlignedObservedRegion> = new Array<AlignedObservedRegion>();
        const unModelledList: Array<number> =  this.unObservedResidues.get(alignmentContext.targetId);
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
            outRegions[outRegions.length-1].openEnd = (outRegions[outRegions.length-1].target_end != alignmentContext.targetSequenceLength && !alignmentContext.querySequenceLength);
        }
        return outRegions.map(r=>range(r.query_begin,r.query_end+1).map((p,n)=>this.alignmentTrackFactory.addAuthorResIds({
            begin: p,
            oriBegin: region.target_begin+n,
            sourceId: alignmentContext.targetId,
            source: alignmentContext.to,
            provenanceName: RcsbAnnotationConstants.provenanceName.pdb,
            provenanceColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
            openBegin: r.openBegin,
            openEnd: r.openEnd,
            type: "ALIGNED_BLOCK",
            title: r.unModelled ? "UNMODELED REGION" : "ALIGNED REGION",
            value: r.unModelled ? 0: 100

        }, alignmentContext))).flat();
    }

}