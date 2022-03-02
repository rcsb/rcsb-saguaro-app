import {ExternalTrackBuilderInterface} from "../../RcsbCollectTools/FeatureTools/ExternalTrackBuilderInterface";
import {
    InterpolationTypes,
    RcsbFvDisplayTypes,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import {SequenceCollectorDataInterface} from "../../RcsbCollectTools/SequenceCollector/SequenceCollector";
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {AlignmentResponse, AnnotationFeatures} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {alignmentVariation} from "./AlignmentVariation";

export function alignmentGlobalLigandBindingSite(): ExternalTrackBuilderInterface {
    const trackName: string = "GLOBAL BINDINGS";
    const bindingSiteMap: Map<string,RcsbFvTrackDataElementInterface> = new Map<string, RcsbFvTrackDataElementInterface>();
    let max: number = 0;
    const addConservation: ExternalTrackBuilderInterface = alignmentVariation();

    return {
        async addTo(tracks: { annotationTracks: Array<RcsbFvRowConfigInterface>, alignmentTracks: SequenceCollectorDataInterface}): Promise<void> {
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
            if(bindingSiteMap.size > 0)
                await addConservation.addTo(tracks);
            return void 0;
        },
        async processAlignmentAndFeatures(data: { annotations: Array<AnnotationFeatures>, alignments: AlignmentResponse }): Promise<void> {
            processFeatures(data.annotations);
            await addConservation.processAlignmentAndFeatures(data);
            return void 0;
        },
        filterFeatures(data:{annotations: Array<AnnotationFeatures>}): Promise<Array<AnnotationFeatures>> {
            const annotations: Array<AnnotationFeatures> = data.annotations;
            annotations.forEach(ann=>{
                ann.features = ann.features.filter(f=>f.name.includes("ligand"));
            })
            return new Promise<Array<AnnotationFeatures>>((resolve => {
                resolve(annotations);
            }));
        }
    };

    function processFeatures(annotations: Array<AnnotationFeatures>){
        annotations.forEach(ann => {
            ann.features.forEach(d => {
                d.feature_positions.forEach(p=>{
                    p.values.forEach((v,n)=>{
                        const key: string = (p.beg_seq_id+n).toString();
                        if(!bindingSiteMap.has(key)){
                            bindingSiteMap.set(key,{
                                begin: p.beg_seq_id+n,
                                type: trackName,
                                value: v
                            })
                            if(max == 0)
                                max = v;
                        }else{
                            (bindingSiteMap.get(key).value as number) += v;
                            if((bindingSiteMap.get(key).value as number) > max)
                                max = (bindingSiteMap.get(key).value as number);
                        }
                    });
                });
            });
        });
    }

}
