import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {
    InterpolationTypes,
    RcsbFvDisplayTypes
} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";

import {ExternalTrackBuilderInterface} from "../../RcsbCollectTools/FeatureTools/ExternalTrackBuilderInterface";
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {SequenceAlignments, SequenceAnnotations} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Borrego/GqlTypes";
import {groupExternalTrackBuilder} from "./GroupExternalTrackBuilder";
import {PolymerEntityInstanceInterface} from "../../RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";
import {Assertions} from "../Helpers/Assertions";
import assertDefined = Assertions.assertDefined;
import {
    RcsbFvTrackDataAnnotationInterface
} from "../../RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/RcsbFvTrackDataAnnotationInterface";
import {GroupProvenanceId} from "@rcsb/rcsb-api-tools/lib/RcsbDw/Types/DwEnums";

export function alignmentGlobalLigandBindingSite(groupProvenance:GroupProvenanceId): ExternalTrackBuilderInterface {
    const trackName: string = "GLOBAL BINDING";
    const bindingSiteMap: Map<string,RcsbFvTrackDataAnnotationInterface> = new Map<string, RcsbFvTrackDataAnnotationInterface>();
    let max: number = 0;
    const groupTrackBuilder: ExternalTrackBuilderInterface = groupExternalTrackBuilder(groupProvenance);

    return {
        async addTo(tracks: { annotationTracks: Array<RcsbFvRowConfigInterface>, alignmentTracks: Array<RcsbFvRowConfigInterface>}): Promise<void> {
            if(Array.from(bindingSiteMap.values()).length > 0)
                tracks.annotationTracks.unshift({
                    trackId: "annotationTrack_GLOBAL_BINDINGS",
                    trackHeight: 40,
                    displayType: RcsbFvDisplayTypes.AREA,
                    overlap: true,
                    trackColor: "#F9F9F9",
                    displayColor: "#c4124b",
                    titleFlagColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                    rowTitle: trackName,
                    displayDomain: [0, max],
                    interpolationType: InterpolationTypes.STEP,
                    trackData: Array.from(bindingSiteMap.values())
                });
            await groupTrackBuilder.addTo?.(tracks);
        },
        async processAlignmentAndFeatures(data: { annotations: Array<SequenceAnnotations>, alignments: SequenceAlignments }): Promise<void> {
            await groupTrackBuilder.processAlignmentAndFeatures?.(data);
            processFeatures(data.annotations);
        },
        async filterFeatures(data:{annotations: Array<SequenceAnnotations>}): Promise<Array<SequenceAnnotations>> {
            const annotations: Array<SequenceAnnotations> = await groupTrackBuilder.filterFeatures?.(data) ?? [];
            annotations.forEach(ann=>{
                ann.features = ann.features?.filter(f=> f ? f.name?.includes("ligand") : false);
            })
            return new Promise<Array<SequenceAnnotations>>((resolve => {
                resolve(annotations);
            }));
        },
        filterAlignments(data: {alignments:SequenceAlignments;rcsbContext?:Partial<PolymerEntityInstanceInterface>;}): Promise<SequenceAlignments> {
            assertDefined(groupTrackBuilder.filterAlignments);
            return groupTrackBuilder.filterAlignments(data);
        }
    };

    function processFeatures(annotations: Array<SequenceAnnotations>){
        // position > ligand name
        const ligandMap: Map<string,Set<string>> = new Map<string, Set<string>>();
        annotations.forEach(ann => {
            ann.features?.forEach(d => {
                if(d)
                    d.feature_positions?.forEach(p=>{
                        if(p?.beg_seq_id){
                            const key: string = (p.beg_seq_id).toString();
                            if(!ligandMap.has(key))
                                ligandMap.set(key, new Set<string>());
                            else if(d.name && !ligandMap.get(key)?.has(d.name))
                                ligandMap.get(key)?.add(d.name)
                            else
                                return;
                            const bs = bindingSiteMap.get(key);
                            if(!bs){
                                bindingSiteMap.set(key,{
                                    begin: p.beg_seq_id,
                                    type: trackName,
                                    value: 1
                                })
                                if(max == 0)
                                    max = 1;
                            }else{
                                if(bs){
                                    (bs.value as number) += 1;
                                    if((bs.value as number) > max)
                                        max = (bs.value as number);
                                }
                            }
                        }
                    });
            });
        });
    }

}
