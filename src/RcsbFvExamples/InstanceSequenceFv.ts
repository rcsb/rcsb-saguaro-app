import {buildInstanceSequenceFv} from "../RcsbFvWeb/RcsbFvBuilder";
import {RcsbFvDisplayTypes, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {
    AlignmentResponse,
    AnnotationFeatures,
    Type
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {PolymerEntityInstanceInterface} from "../RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";

buildInstanceSequenceFv("pfv", "select", "1A6D", {module:"interface"},{
    externalTrackBuilder: externalTrackBuilder()
}).then((module)=>{
    console.log(module);
});

function externalTrackBuilder(){
    let myComputedTrack: RcsbFvRowConfigInterface = {
        trackId: "blockTrack",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        titleFlagColor: "#48a1b3",
        displayType: RcsbFvDisplayTypes.BLOCK,
        displayColor: "#56e0f5",
        rowTitle: "COMPUTED",
        trackData: [{
            begin:10,
            end:100
        }]
    };
    return {
        processAlignmentAndFeatures(data: { annotations?: Array<AnnotationFeatures>; alignments?: AlignmentResponse }): Promise<void> {
            return new Promise<void>(resolve => {
                myComputedTrack.trackData = [];
                data.annotations?.forEach(a=>{
                    a.features?.forEach(f=>{
                        if(f!=null && f.type === Type.RegionOfInterest){
                            if(f.feature_positions)
                                myComputedTrack.trackData?.push( ...f.feature_positions?.map(p=>({
                                    begin:p?.beg_seq_id ?? 0,
                                    end:p?.end_seq_id ?? undefined
                                })))
                        }
                    })
                });
                resolve(void 0);
            })

        },
        addTo(tracks: { alignmentTracks?: Array<RcsbFvRowConfigInterface>; annotationTracks?: Array<RcsbFvRowConfigInterface>; rcsbContext?: Partial<PolymerEntityInstanceInterface>; }): Promise<void> {
            return new Promise<void>(resolve => {
                if (tracks.rcsbContext?.asymId === "A" && myComputedTrack?.trackData && myComputedTrack.trackData.length > 0) {
                    tracks.annotationTracks?.push(myComputedTrack);
                }
                resolve(void 0);
            })
        },
        filterFeatures(data: {annotations: Array<AnnotationFeatures>; rcsbContext:Partial<PolymerEntityInstanceInterface>}): Promise<Array<AnnotationFeatures>> {
            return new Promise<Array<AnnotationFeatures>>(resolve => {
                resolve(data.annotations);
            })
        }
    }
}