import {ExternalTrackBuilderInterface} from "../../RcsbCollectTools/FeatureTools/ExternalTrackBuilderInterface";
import {Logo} from "./Logo";
import {RcsbFvDisplayTypes, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {AlignmentResponse, AnnotationFeatures} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";

export function alignmentVariation(): ExternalTrackBuilderInterface {

    const seqName = "CONSENSUS SEQUENCE";
    const conservationName = "CONSERVATION";
    let querySequenceLogo: Logo<aaType>[] = new Array<Logo<aaType>>();

    return {
        addTo(tracks: { annotationTracks: RcsbFvRowConfigInterface[], alignmentTracks: RcsbFvRowConfigInterface[]}): Promise<void> {
            if(querySequenceLogo.length == 0)
                return;
            [{
                trackId: "annotationTrack_ALIGNMENT_FREQ",
                displayType: RcsbFvDisplayTypes.MULTI_AREA,
                trackColor: "#F9F9F9",
                displayColor: {
                    thresholds:[],
                    colors:["#5289e9", "#76bbf6", "#91cef6", "#b9d9f8", "#d6eafd", "#e6f5fd", "#f9f9f9"]
                },
                trackHeight: 20,
                titleFlagColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                rowTitle: conservationName,
                trackData: querySequenceLogo.map((s,n)=>{
                    const nFreq = 5;
                    const maxFreqList: number[] = s.frequency().filter(f=>f.symbol!="-").slice(0,nFreq).map(f=>Math.trunc(f.value*100)/100);
                    const gapFreq: number  = Math.trunc(s.frequency().filter(f=>f.symbol=="-")[0].value*100)/100;
                    return {
                        begin: n+1,
                        values: maxFreqList.map((f,n)=>maxFreqList.slice(0,(n+1)).reduce((v,n)=>v+n)).concat([1-gapFreq,1]),
                        value: s.frequency()[0].symbol != "-" ? Math.trunc(s.frequency()[0].value*100)/100 : 0
                    };
                })
            },{
                trackId: "annotationTrack_ALIGNMENT_MODE",
                displayType: RcsbFvDisplayTypes.SEQUENCE,
                trackColor: "#F9F9F9",
                titleFlagColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
                rowTitle: seqName,
                nonEmptyDisplay: true,
                trackData: querySequenceLogo.map((s,n)=>({
                    begin: n+1,
                    value: s.mode(),
                    description: [s.frequency().filter(s=>(s.value>=0.01)).map(s=>(s.symbol.replace("-","gap")+": "+Math.trunc(s.value*100)/100)).join(", ")]
                }))
            }].forEach(track=>tracks.alignmentTracks.unshift(track));
            querySequenceLogo = [];
            return void 0;
        },
        processAlignmentAndFeatures(data: { annotations: AnnotationFeatures[], alignments: AlignmentResponse }): Promise<void> {
            processAlignments(data.alignments);
            return void 0;
        },
        filterFeatures(data:{annotations: AnnotationFeatures[]}): Promise<AnnotationFeatures[]> {
            const annotations: AnnotationFeatures[] = data.annotations;
            annotations.forEach(ann=>{
                ann.features = ann.features.filter(f=>(f.name != "automated matches"));
            })
            return new Promise<AnnotationFeatures[]>((resolve)=>{
                resolve(annotations);
            });
        }
    };

    function processAlignments(alignment: AlignmentResponse){
        if(alignment.alignment_length && alignment.alignment_length != alignment.alignment_logo.length)
            throw "ERROR Alignment length and logo should match"
        alignment.alignment_logo?.forEach(al=>{
            querySequenceLogo.push(new Logo<aaType>(al));
        });
    }

}

type aaType = "A"|"R"|"N"|"D"|"C"|"E"|"Q"|"G"|"H"|"I"|"L"|"K"|"M"|"F"|"P"|"S"|"T"|"W"|"Y"|"V"|"-"|"X";
