import {
    RcsbFvLink,
    RcsbFvRowConfigInterface
} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import resource from "../../RcsbServerConfig/web.resources.json";
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {ExternalTrackBuilderInterface} from "./ExternalTrackBuilderInterface";
import {SequenceAnnotations, SequenceAlignments} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {PolymerEntityInstanceInterface} from "../DataCollectors/PolymerEntityInstancesCollector";
import {
    RcsbFvTrackDataAnnotationInterface
} from "../../RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/RcsbFvTrackDataAnnotationInterface";


export class FeatureTools {

    private static readonly rcsbLigand: RegExp = new RegExp(/^(ligand)(\s)(\w{1,3})$/);

    static mergeBlocks(blocks: Array<RcsbFvTrackDataAnnotationInterface>){
        let merged = false;
        do{
            merged = false;
            for(let n=0; n<(blocks.length-1); n++){
                const end = blocks[n].end;
                if(!end)
                    return;
                if( (blocks[n].oriEnd ?? Number.MIN_SAFE_INTEGER)+1 == blocks[n+1].oriBegin && blocks[n].color === blocks[n+1].color){
                    if(blocks[n].gaps == null)
                        blocks[n].gaps = []
                    blocks[n].gaps?.push({begin:end,end:blocks[n+1].begin, isConnected:true});
                    blocks[n].end = blocks[n+1].end;
                    blocks[n].oriEnd = blocks[n+1].oriEnd;
                    blocks.splice((n+1),1);
                    merged = true;
                    break;
                }
            }
        }while(merged);
    }

    static parseLink(title: string): RcsbFvLink{
        let match: RegExpExecArray | null = FeatureTools.rcsbLigand.exec(title);
        if(match) {
            return {
                visibleTex: match[3],
                url: (resource as any).rcsb_ligand.url+match[3],
                style:{
                    color:RcsbAnnotationConstants.provenanceColorCode.rcsbLink,
                    fontWeight:"bold"
                }
            }

        }else if(title == "binding_site"){
            return {visibleTex: "", style:{fontWeight:"bold"}}
        }
        return {visibleTex: title, style:{fontWeight:"bold"}}
    }

    static mergeTrackBuilders(builderA:ExternalTrackBuilderInterface, builderB?:ExternalTrackBuilderInterface): ExternalTrackBuilderInterface {
        return {
            async addTo(tracks: {
                annotationTracks: Array<RcsbFvRowConfigInterface>,
                alignmentTracks: Array<RcsbFvRowConfigInterface>
            }): Promise<void> {
                await builderA.addTo?.(tracks);
                await builderB?.addTo?.(tracks);
            },
            async processAlignmentAndFeatures(data: {
                annotations: Array<SequenceAnnotations>,
                alignments: SequenceAlignments
            }): Promise<void> {
                await builderA.processAlignmentAndFeatures?.(data);
                await builderB?.processAlignmentAndFeatures?.(data);
            },
            async filterFeatures(data: {
                annotations: Array<SequenceAnnotations>;
                rcsbContext?:Partial<PolymerEntityInstanceInterface>;
            }): Promise<Array<SequenceAnnotations>> {
                let annotations = data.annotations;
                const rcsbContext = data.rcsbContext;
                if(builderA.filterFeatures) annotations = await builderA.filterFeatures({annotations, rcsbContext});
                if(builderB?.filterFeatures) annotations = await builderB.filterFeatures({annotations, rcsbContext});
                return annotations;
            },
            async filterAlignments(data: {
                alignments: SequenceAlignments;
                rcsbContext?: Partial<PolymerEntityInstanceInterface>;
            }): Promise<SequenceAlignments> {
                let alignments = data.alignments;
                const rcsbContext = data.rcsbContext;
                if(builderA.filterAlignments) alignments = await builderA.filterAlignments({alignments, rcsbContext});
                if(builderB?.filterAlignments) alignments = await builderB.filterAlignments({alignments, rcsbContext});
                return alignments;
            }
        }
    }

}