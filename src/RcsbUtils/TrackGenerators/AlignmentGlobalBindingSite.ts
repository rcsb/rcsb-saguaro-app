import {ExternalTrackBuilderInterface} from "../../RcsbCollectTools/FeatureTools/ExternalTrackBuilderInterface";
import {
    InterpolationTypes,
    RcsbFvDisplayTypes,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {AlignmentResponse, AnnotationFeatures} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {groupExternalTrackBuilder} from "./GroupExternalTrackBuilder";

export function alignmentGlobalLigandBindingSite(): ExternalTrackBuilderInterface {
    const trackName: string = "GLOBAL BINDINGS";
    const bindingSiteMap: Map<string,RcsbFvTrackDataElementInterface> = new Map<string, RcsbFvTrackDataElementInterface>();
    let max: number = 0;
    const addConservation: ExternalTrackBuilderInterface = groupExternalTrackBuilder();

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
            await addConservation.addTo?.(tracks);
        },
        async processAlignmentAndFeatures(data: { annotations: Array<AnnotationFeatures>, alignments: AlignmentResponse }): Promise<void> {
            processFeatures(data.annotations);
            await addConservation.processAlignmentAndFeatures?.(data);
        },
        filterFeatures(data:{annotations: Array<AnnotationFeatures>}): Promise<Array<AnnotationFeatures>> {
            const annotations: Array<AnnotationFeatures> = data.annotations;
            annotations.forEach(ann=>{
                ann.features = ann.features?.filter(f=> f ? f.name?.includes("ligand") : false);
            })
            return new Promise<Array<AnnotationFeatures>>((resolve => {
                resolve(annotations);
            }));
        }
    };

    function processFeatures(annotations: Array<AnnotationFeatures>){
        // position > ligand name
        const ligandMap: Map<string,Set<string>> = new Map<string, Set<string>>();
        annotations.forEach(ann => {
            ann.features?.forEach(d => {
                if(d)
                    d.feature_positions?.forEach(p=>{
                        if(p?.beg_seq_id)
                            p.values?.forEach((v,n)=>{
                                const key: string = (p.beg_seq_id as number+n).toString();
                                if(!ligandMap.has(key))
                                    ligandMap.set(key, new Set<string>());
                                else if(d.name && !ligandMap.get(key)?.has(d.name))
                                    ligandMap.get(key)?.add(d.name)
                                else
                                    return;
                                const bs = bindingSiteMap.get(key);
                                if(!bs){
                                    bindingSiteMap.set(key,{
                                        begin: p.beg_seq_id as number+n,
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
                            });
                    });
            });
        });
    }

}
