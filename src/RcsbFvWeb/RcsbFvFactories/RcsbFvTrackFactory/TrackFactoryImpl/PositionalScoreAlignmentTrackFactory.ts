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
import {TagDelimiter} from "../../../../RcsbUtils/Helpers/TagDelimiter";
import {AlignmentRequestContextType, TrackFactoryInterface} from "../TrackFactoryInterface";
import {
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import {Operator} from "../../../../RcsbUtils/Helpers/Operator";
import {range} from "lodash";

import {PlainAlignmentTrackFactory} from "./PlainAlignmentTrackFactory";
import {TrackUtils} from "./Helper/TrackUtils";
import {rcsbRequestCtxManager} from "../../../../RcsbRequest/RcsbRequestContextManager";
import {EntryPropertyIntreface} from "../../../../RcsbCollectTools/DataCollectors/MultipleEntryPropertyCollector";

export class PositionalScoreAlignmentTrackFactory implements TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment]>{

    private alignmentTrackFactory: PlainAlignmentTrackFactory;
    private positionalScores: Map<string,Map<number,number>> = new Map<string, Map<number,number>>();

    private readonly instanceEntityMap: Map<string,string> = new Map<string, string>();

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate) {
        this.alignmentTrackFactory = new PlainAlignmentTrackFactory(entityInstanceTranslator);
    }

    public async getTrack(alignmentRequestContext: AlignmentRequestContextType, targetAlignment: TargetAlignment, alignedRegionToTrackElementList?: (region:AlignedRegion, alignmentContext: AlignmentContextInterface)=>RcsbFvTrackDataElementInterface[]): Promise<RcsbFvRowConfigInterface> {
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

    public async prepareFeatures(positionalScores: AnnotationFeatures[]): Promise<void>{
        await this.collectFeatureEntryProperties(positionalScores);
        this.prepareFeaturesAlignmentMap(positionalScores);
    }

    private async collectFeatureEntryProperties(unObservedRegions: AnnotationFeatures[]): Promise<void>{
        const entryIds: string[] = Operator.uniqueValues<string>(unObservedRegions.map(uor=>uor.target_id.split(TagDelimiter.instance)[0]));
        //TODO define a Translator class for multiple entry entry data
        const entryProperties: EntryPropertyIntreface[] = (await Promise.all<EntryPropertyIntreface[]>(Operator.arrayChunk(entryIds, 100).map(ids => rcsbRequestCtxManager.getEntryProperties(ids)))).flat();
        entryProperties.forEach(ep=>{
            ep.entityToInstance.forEach((instanceList,entityId)=>{
                instanceList.forEach(instanceId=>{
                    this.instanceEntityMap.set(instanceId,entityId);
                })
            });
        });
    }

    private prepareFeaturesAlignmentMap(positionalScores: AnnotationFeatures[]){
        const instancePositionalScores: Map<string,Map<number,number>> = new Map<string, Map<number,number>>();
        positionalScores.forEach(ps=> {
            const instanceId: string = ps.target_id;
            if(!instancePositionalScores.has(instanceId))
                instancePositionalScores.set(instanceId, new Map<number,number>())
            ps.features.forEach(feature=>{
                feature.feature_positions.forEach(fp=>{
                    fp.values.forEach((v,n)=>{
                        instancePositionalScores.get(instanceId).set(fp.beg_seq_id+n,v);
                    });
                });
            });
        });
        const entityPositionalScore: Map<string,Map<number,number>> = new Map<string, Map<number,number>>();
        instancePositionalScores.forEach((ips,instanceId)=>{
            const entityId: string = this.instanceEntityMap.get(instanceId);
            if(!entityPositionalScore.has(entityId))
                entityPositionalScore.set(entityId, new Map<number, number>());

            ips.forEach((score,position)=>{
                if(!entityPositionalScore.get(entityId).has(position)){
                    entityPositionalScore.get(entityId).set(position,score);
                }else if(score < entityPositionalScore.get(entityId).get(position) ){
                    entityPositionalScore.get(entityId).set(position,score);
                }
            });
        });
        this.positionalScores = entityPositionalScore;
    }

    private alignedRegionToTrackElementList(region: AlignedRegion, alignmentContext: AlignmentContextInterface): RcsbFvTrackDataElementInterface[]{
        if(!this.positionalScores.has(alignmentContext.targetId) || this.positionalScores.get(alignmentContext.targetId).size == 0)
            return this.alignmentTrackFactory.alignedRegionToTrackElementList(region, alignmentContext);
        const outRegions: RcsbFvTrackDataElementInterface[] = [];
        const entityPositionalScores: Map<number,number> =  this.positionalScores.get(alignmentContext.targetId);
        if(entityPositionalScores.size>0) {
            range(region.query_begin,region.query_end+1).forEach((p,n)=>outRegions.push(this.alignmentTrackFactory.addAuthorResIds({
                begin: p,
                oriBegin: region.target_begin+n,
                value: entityPositionalScores.get(p),
                sourceId: alignmentContext.targetId,
                source: TrackUtils.transformSourceFromTarget(alignmentContext.targetId,alignmentContext.to),
                provenanceName: TrackUtils.getProvenanceConfigFormTarget(alignmentContext.targetId,alignmentContext.to).name,
                provenanceColor: TrackUtils.getProvenanceConfigFormTarget(alignmentContext.targetId,alignmentContext.to).color,
                type: Type.MaQaMetricLocalTypeOther,
            }, alignmentContext)));
        }
        return outRegions;
    }

}