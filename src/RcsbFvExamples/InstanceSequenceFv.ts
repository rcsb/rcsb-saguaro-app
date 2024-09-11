import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbFvDisplayTypes} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {
    SequenceAlignments,
    SequenceAnnotations,
    FeaturesType
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {buildInstanceSequenceFv} from "../RcsbFvWeb/RcsbFvBuilder";
import {PolymerEntityInstanceInterface} from "../RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";


buildInstanceSequenceFv("pfv", "select", "8PDU", {
    module:"interface",
    onChangeCallback: (r)=>{
        console.log(r);
    },
    defaultValue: "A"
},{
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
        processAlignmentAndFeatures(data: { annotations?: Array<SequenceAnnotations>; alignments?: SequenceAlignments }): Promise<void> {
            return new Promise<void>(resolve => {
                myComputedTrack.trackData = [];
                data.annotations?.forEach(a=>{
                    a.features?.forEach(f=>{
                        if(f!=null && f.type === FeaturesType.RegionOfInterest){
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
        filterFeatures(data: {annotations: Array<SequenceAnnotations>; rcsbContext:Partial<PolymerEntityInstanceInterface>}): Promise<Array<SequenceAnnotations>> {
            return new Promise<Array<SequenceAnnotations>>(resolve => {
                resolve(data.annotations);
            })
        }
    }
}