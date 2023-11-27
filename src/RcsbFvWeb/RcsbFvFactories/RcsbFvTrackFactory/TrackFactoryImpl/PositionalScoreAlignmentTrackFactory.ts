import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro/lib/RcsbDataManager/RcsbDataManager";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";

import {
    AlignedRegion,
    AnnotationFeatures,
    TargetAlignment,
    Type
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    AlignmentContextInterface,
    PolymerEntityInstanceTranslate
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
import {RcsbFvTrackDataAnnotationInterface} from "../RcsbFvTrackDataAnnotationInterface";

export class PositionalScoreAlignmentTrackFactory implements TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment]>{

    private alignmentTrackFactory: PlainAlignmentTrackFactory;
    private positionalScores: Map<string,Map<number,number>> = new Map<string, Map<number,number>>();

    private readonly instanceEntityMap: Map<string,string> = new Map<string, string>();

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate) {
        this.alignmentTrackFactory = new PlainAlignmentTrackFactory(entityInstanceTranslator);
    }

    public async getTrack(
        alignmentRequestContext: AlignmentRequestContextType,
        targetAlignment: TargetAlignment,
        alignedRegionToTrackElementList?: (region:AlignedRegion, alignmentContext: AlignmentContextInterface)=>Array<RcsbFvTrackDataElementInterface>
    ): Promise<RcsbFvRowConfigInterface> {
        return this.alignmentTrackFactory.getTrack(
            alignmentRequestContext,
            targetAlignment,
            this.alignedRegionToTrackElementList.bind(this),
            {
                colors: ["#ff7d45","#ffdb13","#65cbf3","#0053d6"],
                thresholds: [50,70,90]
            }
        );

    }

    public async prepareFeatures(positionalScores: Array<AnnotationFeatures>): Promise<void>{
        await this.collectFeatureEntryProperties(positionalScores);
        this.prepareFeaturesAlignmentMap(positionalScores);
    }

    private async collectFeatureEntryProperties(unObservedRegions: Array<AnnotationFeatures>): Promise<void>{
        const entryIds: string[] = Operator.uniqueValues<string>(unObservedRegions.map(uor=>{
            assertDefined(uor.target_id);
            return uor.target_id.split(TagDelimiter.instance)[0];
        }));
        //TODO define a Translator class for multiple entry entry data
        const entryProperties: EntryPropertyInterface[] = (await Promise.all<EntryPropertyInterface[]>(Operator.arrayChunk(entryIds, 100).map(ids => rcsbRequestCtxManager.getEntryProperties(ids)))).flat();
        entryProperties.forEach(ep=>{
            ep.entityToInstance.forEach((instanceList,entityId)=>{
                instanceList.forEach(instanceId=>{
                    this.instanceEntityMap.set(instanceId,entityId);
                })
            });
        });
    }

    private prepareFeaturesAlignmentMap(positionalScores: Array<AnnotationFeatures>){
        const instancePositionalScores: Map<string,Map<number,number>> = new Map<string, Map<number,number>>();
        positionalScores.forEach(ps=> {
            if(!ps.target_id)
                return;
            const instanceId: string = ps.target_id;
            if(!instancePositionalScores.has(instanceId))
                instancePositionalScores.set(instanceId, new Map<number,number>())
            ps.features?.forEach(feature=>{
                feature?.feature_positions?.forEach(fp=>{
                    fp?.values?.forEach((v,n)=>{
                        if(fp.beg_seq_id && v)
                            instancePositionalScores.get(instanceId)?.set(fp.beg_seq_id+n,v);
                    });
                });
            });
        });
        const entityPositionalScore: Map<string,Map<number,number>> = new Map<string, Map<number,number>>();
        instancePositionalScores.forEach((ips,instanceId)=>{
            const entityId: string | undefined = this.instanceEntityMap.get(instanceId);
            if(!entityId)
                return
            if(!entityPositionalScore.has(entityId))
                entityPositionalScore.set(entityId, new Map<number, number>());
            const o = entityPositionalScore.get(entityId);
            assertDefined(o);
            ips.forEach((score,position)=>{
                if(!o.has(position)){
                    o.set(position,score);
                }else if(score < (o.get(position) ?? Number.MIN_SAFE_INTEGER) ){
                    o.set(position,score);
                }
            });
        });
        this.positionalScores = entityPositionalScore;
    }

    private alignedRegionToTrackElementList(region: AlignedRegion, alignmentContext: AlignmentContextInterface): Array<RcsbFvTrackDataElementInterface>{
        if(!this.positionalScores.has(alignmentContext.targetId) || this.positionalScores.get(alignmentContext.targetId)?.size == 0)
            return this.alignmentTrackFactory.alignedRegionToTrackElementList(region, alignmentContext);
        const outRegions: Array<RcsbFvTrackDataAnnotationInterface> = [];
        const entityPositionalScores: Map<number,number> | undefined =  this.positionalScores.get(alignmentContext.targetId);
        if(entityPositionalScores && entityPositionalScores.size>0) {
            range(region.query_begin,region.query_end+1).forEach((p,n)=>{
                if(!alignmentContext.to)
                    return;
                outRegions.push(this.alignmentTrackFactory.addAuthorResIds({
                    begin: p,
                    oriBegin: region.target_begin+n,
                    value: entityPositionalScores.get(p),
                    sourceId: alignmentContext.targetId,
                    source: TrackUtils.transformSourceFromTarget(alignmentContext.targetId,alignmentContext.to),
                    provenanceName: TrackUtils.getProvenanceConfigFormTarget(alignmentContext.targetId,alignmentContext.to).name,
                    provenanceColor: TrackUtils.getProvenanceConfigFormTarget(alignmentContext.targetId,alignmentContext.to).color,
                    type: Type.MaQaMetricLocalTypeOther,
                }, alignmentContext))
            });
        }
        return outRegions;
    }

}