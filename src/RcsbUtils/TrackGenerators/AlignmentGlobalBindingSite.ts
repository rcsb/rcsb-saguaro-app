import {ExternalTrackBuilderInterface} from "../../RcsbCollectTools/FeatureTools/ExternalTrackBuilderInterface";
import {
    InterpolationTypes,
    RcsbFvDisplayTypes,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {AlignmentResponse, AnnotationFeatures} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {alignmentVariation} from "./AlignmentVariation";

export function alignmentGlobalLigandBindingSite(): ExternalTrackBuilderInterface {
    const trackName = "GLOBAL BINDINGS";
    const bindingSiteMap: Map<string,RcsbFvTrackDataElementInterface> = new Map<string, RcsbFvTrackDataElementInterface>();
    let max = 0;
    const addConservation: ExternalTrackBuilderInterface = alignmentVariation();

    return {
        async addTo(tracks: { annotationTracks: RcsbFvRowConfigInterface[], alignmentTracks: RcsbFvRowConfigInterface[]}): Promise<void> {
            if(Array.from(bindingSiteMap.values()).length > 0)
                tracks.annotationTracks.unshift({
                    trackId: "annotationTrack_GLOBAL_BINDINGS",
                    trackHeight: 40,
                    displayType: RcsbFvDisplayTypes.AREA,
                    trackColor: "#F9F9F9",
                    displayColor: "#c4124b",
                    titleFlagColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                    rowTitle: trackName,
                    displayDomain: [0, max],
                    interpolationType: InterpolationTypes.STEP,
                    trackData: Array.from(bindingSiteMap.values())
                });
            await addConservation.addTo(tracks);
            return void 0;
        },
        async processAlignmentAndFeatures(data: { annotations: AnnotationFeatures[], alignments: AlignmentResponse }): Promise<void> {
            processFeatures(data.annotations);
            await addConservation.processAlignmentAndFeatures(data);
            return void 0;
        },
        filterFeatures(data:{annotations: AnnotationFeatures[]}): Promise<AnnotationFeatures[]> {
            const annotations: AnnotationFeatures[] = data.annotations;
            annotations.forEach(ann=>{
                ann.features = ann.features.filter(f=>f.name.includes("ligand"));
            })
            return new Promise<AnnotationFeatures[]>((resolve => {
                resolve(annotations);
            }));
        }
    };

    function processFeatures(annotations: AnnotationFeatures[]){
        // position > ligand name
        const ligandMap: Map<string,Set<string>> = new Map<string, Set<string>>();
        annotations.forEach(ann => {
            ann.features.forEach(d => {
                d.feature_positions.forEach(p=>{
                    p.values.forEach((v,n)=>{
                        const key: string = (p.beg_seq_id+n).toString();
                        if(!ligandMap.has(key))
                            ligandMap.set(key, new Set<string>());
                        else if(!ligandMap.get(key).has(d.name))
                            ligandMap.get(key).add(d.name)
                        else
                            return;
                        if(!bindingSiteMap.has(key)){
                            bindingSiteMap.set(key,{
                                begin: p.beg_seq_id+n,
                                type: trackName,
                                value: 1
                            })
                            if(max == 0)
                                max = 1;
                        }else{
                            (bindingSiteMap.get(key).value as number) += 1;
                            if((bindingSiteMap.get(key).value as number) > max)
                                max = (bindingSiteMap.get(key).value as number);
                        }
                    });
                });
            });
        });
    }

}
