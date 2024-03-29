import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbFvDisplayTypes} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";

import {ExternalTrackBuilderInterface} from "../../RcsbCollectTools/FeatureTools/ExternalTrackBuilderInterface";
import {Logo} from "./Logo";
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {AlignmentResponse, AnnotationFeatures} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {Assertions} from "../Helpers/Assertions";
import assertElementListDefined = Assertions.assertElementListDefined;
import {GroupGapLessTransformer} from "../Groups/GroupGapLessTransformer";
import {PolymerEntityInstanceInterface} from "../../RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";

export function groupExternalTrackBuilder(): ExternalTrackBuilderInterface {

    const seqName: string = "CONSENSUS SEQUENCE";
    const conservationName: string = "SEQUENCE VARIATION";
    const querySequenceLogo: Array<Logo<aaType>> = new Array<Logo<aaType>>();
    const gapLessTransformer: GroupGapLessTransformer = new GroupGapLessTransformer();
    let variationRowData: Array<RcsbFvRowConfigInterface>;

    return {
        addTo(tracks: { annotationTracks: Array<RcsbFvRowConfigInterface>, alignmentTracks: Array<RcsbFvRowConfigInterface>}): Promise<void> {
            if(querySequenceLogo.length == 0)
                return new Promise((resolve)=>{
                    resolve();
                });
            variationRowData.forEach(track=>tracks.alignmentTracks.unshift(track));
            return new Promise((resolve)=>{
                resolve();
            });
        },
        processAlignmentAndFeatures(data: { annotations: Array<AnnotationFeatures>, alignments: AlignmentResponse }): Promise<void> {
            return new Promise((resolve)=>{
                resolve();
            });
        },
        filterFeatures(data:{annotations: Array<AnnotationFeatures>}): Promise<Array<AnnotationFeatures>> {
            gapLessTransformer.gapLessFeatures(data.annotations);
            data.annotations.forEach(ann=>{
                ann.features = ann.features?.filter(f=>(f?.name != "automated matches"));
            })
            return new Promise<Array<AnnotationFeatures>>((resolve)=>{
                resolve(data.annotations);
            });
        },
        filterAlignments(data: {alignments:AlignmentResponse;rcsbContext?:Partial<PolymerEntityInstanceInterface>;}): Promise<AlignmentResponse> {
            gapLessTransformer.gapLessAlignments(data.alignments);
            processAlignments(data.alignments);
            return new Promise<AlignmentResponse>((resolve)=>{
                resolve(data.alignments);
            });
        }
    };

    function processAlignments(alignment: AlignmentResponse){
        if(querySequenceLogo.length > 0) {
            return;
        }
        if(alignment.alignment_length && alignment.alignment_logo && alignment.alignment_length != alignment.alignment_logo?.length)
            throw new Error("ERROR Alignment length and logo should match");

        alignment.alignment_logo?.forEach(al=>{
            assertElementListDefined(al);
            querySequenceLogo.push(new Logo<aaType>(al));
        });
        const sequenceRowData = querySequenceLogo.map((s,n)=>{
            const nFreq: number = 5;
            const maxFreqList: Array<number> = s.frequency().filter(f=>f.symbol!="-").slice(0,nFreq).map(f=>Math.trunc(f.value*100)/100);
            const gapFreq: number  = Math.trunc(s.frequency().filter(f=>f.symbol=="-")[0].value*100)/100;
            return {
                begin: n+1,
                values: maxFreqList.map((f,n)=>maxFreqList.slice(0,(n+1)).reduce((v,n)=>v+n)).concat([1-gapFreq,1]),
                value: s.frequency()[0].symbol != "-" ? Math.trunc(s.frequency()[0].value*100)/100 : 0
            };
        });
        const logoRowData = querySequenceLogo.map((s,n)=>({
            begin: n+1,
            label: s.mode(),
            description: [s.frequency().filter(s=>(s.value>=0.01)).slice(0,14).map(s=>(s.symbol.replace("-","gap")+": "+Math.trunc(s.value*100)/100)).join(", ")]
        }))
        variationRowData = [{
            trackId: "annotationTrack_ALIGNMENT_FREQ",
            displayType: RcsbFvDisplayTypes.MULTI_AREA,
            overlap: true,
            trackColor: "#F9F9F9",
            displayColor: {
                thresholds:[],
                colors:["#5289e9", "#76bbf6", "#91cef6", "#b9d9f8", "#d6eafd", "#e6f5fd", "#f9f9f9"]
            },
            trackHeight: 20,
            titleFlagColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
            rowTitle: conservationName,
            trackData: sequenceRowData
        },{
            trackId: "annotationTrack_ALIGNMENT_MODE",
            displayType: RcsbFvDisplayTypes.SEQUENCE,
            overlap: true,
            trackColor: "#F9F9F9",
            titleFlagColor: RcsbAnnotationConstants.provenanceColorCode.rcsbPdb,
            rowTitle: seqName,
            nonEmptyDisplay: true,
            trackData: logoRowData
        }];
    }

}

type aaType = "A"|"R"|"N"|"D"|"C"|"E"|"Q"|"G"|"H"|"I"|"L"|"K"|"M"|"F"|"P"|"S"|"T"|"W"|"Y"|"V"|"-"|"X"|"U";
