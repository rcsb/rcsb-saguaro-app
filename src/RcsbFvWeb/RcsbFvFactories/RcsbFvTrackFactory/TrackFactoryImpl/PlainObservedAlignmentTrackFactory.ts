import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro/lib/RcsbDataManager/RcsbDataManager";

import {
    AlignedRegions,
    SequenceAnnotations,
    TargetAlignments
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    PolymerEntityInstanceTranslate,
    AlignmentContextInterface
} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {TrackFactoryInterface} from "../TrackFactoryInterface";
import {AlignmentRequestContextType} from "./AlignmentTrackFactory";
import {Operator} from "../../../../RcsbUtils/Helpers/Operator";

import {range} from "lodash";
import {PlainAlignmentTrackFactory} from "./PlainAlignmentTrackFactory";
import {TrackUtils} from "./Helper/TrackUtils";
import {rcsbRequestCtxManager} from "../../../../RcsbRequest/RcsbRequestContextManager";
import {EntryPropertyInterface} from "../../../../RcsbCollectTools/DataCollectors/MultipleEntryPropertyCollector";
import {Assertions} from "../../../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;
import {TagDelimiter} from "@rcsb/rcsb-api-tools/build/RcsbUtils/TagDelimiter";

export class PlainObservedAlignmentTrackFactory implements TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignments]>{

    private alignmentTrackFactory: PlainAlignmentTrackFactory;
    private unObservedResidues: Map<string,Array<number>> = new Map<string, Array<number>>();

    private readonly instanceEntityMap: Map<string,string> = new Map<string, string>();
    private readonly entityInstanceNumberMap: Map<string,number> = new Map<string, number>();

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate) {
        this.alignmentTrackFactory = new PlainAlignmentTrackFactory(entityInstanceTranslator);
    }

    public async getTrack(alignmentRequestContext: AlignmentRequestContextType, targetAlignment: TargetAlignments): Promise<RcsbFvRowConfigInterface> {
        return this.alignmentTrackFactory.getTrack(alignmentRequestContext, targetAlignment, this.alignedRegionToTrackElementList.bind(this));
    }

    public async prepareFeatures(unObservedRegions: Array<SequenceAnnotations>): Promise<void>{
        await this.collectFeatureEntryProperties(unObservedRegions);
        this.prepareFeaturesAlignmentMap(unObservedRegions);
    }

    private async collectFeatureEntryProperties(unObservedRegions: Array<SequenceAnnotations>): Promise<void>{
        const entryIds: string[] = Operator.uniqueValues<string>(unObservedRegions.map(uor=>{
            assertDefined(uor.target_id);
            return uor.target_id.split(TagDelimiter.instance)[0]
        }));
        //TODO define a Translator class for multiple entry entry data
        const entryProperties: EntryPropertyInterface[] = (await Promise.all<EntryPropertyInterface[]>(Operator.arrayChunk(entryIds, 100).map(ids => rcsbRequestCtxManager.getEntryProperties(ids)))).flat();
        entryProperties.forEach(ep=>{
            ep.entityToInstance.forEach((instanceList,entityId)=>{
                this.entityInstanceNumberMap.set(entityId, instanceList.length);
                instanceList.forEach(instanceId=>{
                    this.instanceEntityMap.set(instanceId,entityId);
                })
            });
        });
    }

    private prepareFeaturesAlignmentMap(unObservedRegions: Array<SequenceAnnotations>){
        const uoInstanceFeatureMap: Map<string,Set<number>> = new Map<string, Set<number>>();
        unObservedRegions.forEach(ur=> {
            if(!ur.target_id)
                return;
            const instanceId: string = ur.target_id;
            if(!uoInstanceFeatureMap.has(instanceId))
                uoInstanceFeatureMap.set(instanceId, new Set<number>())
            ur.features?.forEach(feature=>{
                feature?.feature_positions?.forEach(fp=>{
                    if(fp?.beg_seq_id && fp?.end_seq_id)
                        for(let i=fp.beg_seq_id;i<=fp.end_seq_id;i++){
                            uoInstanceFeatureMap.get(instanceId)?.add(i);
                        }
                });
            });
        });
        const uoEntityFeatureMap: Map<string,Map<number,number>> = new Map<string, Map<number,number>>();
        uoInstanceFeatureMap.forEach((uoSet,instanceId)=>{
            const entityId: string | undefined = this.instanceEntityMap.get(instanceId);
            if(!entityId)
                return;
            if(!uoEntityFeatureMap.has(entityId))
                uoEntityFeatureMap.set(entityId, new Map<number, number>());

            uoSet.forEach(i=>{
                if(uoEntityFeatureMap.get(entityId)?.has(i)){
                    const v = uoEntityFeatureMap.get(entityId)?.get(i);
                    if(v)
                        uoEntityFeatureMap.get(entityId)?.set(i,v+1);
                }else{
                    uoEntityFeatureMap.get(entityId)?.set(i,1);
                }
            });
        });
        uoEntityFeatureMap.forEach((unObservedMap,entityId)=>{
            this.unObservedResidues.set(entityId, Array.from(unObservedMap.entries()).filter(e=>(e[1]==this.entityInstanceNumberMap.get(entityId))).map(e=>e[0]).sort((a,b)=>a-b));
        })
    }

    private alignedRegionToTrackElementList(region: AlignedRegions, alignmentContext: AlignmentContextInterface): Array<RcsbFvTrackDataElementInterface>{
        if(!this.unObservedResidues.has(alignmentContext.targetId) || this.unObservedResidues.get(alignmentContext.targetId)?.length == 0)
            return this.alignmentTrackFactory.alignedRegionToTrackElementList(region, alignmentContext);
        const unModelledSet: Set<number> =  new Set(this.unObservedResidues.get(alignmentContext.targetId));
        const delta: number = region.target_begin-region.query_begin;
        return range(region.query_begin, region.query_end+1).map((i)=>{
            assertDefined(alignmentContext.to);
            return this.alignmentTrackFactory.addAuthorResIds({
                begin: i,
                oriBegin: i+delta,
                sourceId: alignmentContext.targetId,
                source: TrackUtils.transformSourceFromTarget(alignmentContext.targetId,alignmentContext.to),
                provenanceName: TrackUtils.getProvenanceConfigFormTarget(alignmentContext.targetId,alignmentContext.to).name,
                provenanceColor: TrackUtils.getProvenanceConfigFormTarget(alignmentContext.targetId,alignmentContext.to).color,
                type: "ALIGNED_BLOCK",
                title: unModelledSet.has(i) ? "UNMODELED REGION" : "ALIGNED REGION",
                value: unModelledSet.has(i) ? 0: 100
            }, alignmentContext)
        });

    }

}