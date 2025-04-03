import {SequenceAlignments, SequenceAnnotations} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Borrego/GqlTypes";
import {Logo} from "../TrackGenerators/Logo";
import {Assertions} from "../Helpers/Assertions";
import assertElementListDefined = Assertions.assertElementListDefined;

export class GroupGapLessTransformer {

    private readonly gapLessReference: number[] = [];
    private refLength: number;
    private processAlignments(alignment: SequenceAlignments): void {
        if(this.gapLessReference.length > 0 || !alignment.alignment_logo)
            return;

        const querySequenceLogo: Array<Logo<aaType>> = new Array<Logo<aaType>>();
        if(alignment.alignment_length && alignment.alignment_length != alignment.alignment_logo?.length)
            throw new Error("ERROR Alignment length and logo should match");
        alignment.alignment_logo?.forEach(al=>{
            assertElementListDefined(al);
            querySequenceLogo.push(new Logo<aaType>(al));
        });
        let newIndex: number = 1;
        this.gapLessReference[0] = -1;
        querySequenceLogo.forEach((sl,n)=>{
            if((sl.get("-")/sl.total()) == 1){
                this.gapLessReference[n+1] = -1;
            }else{
                this.gapLessReference[n+1] = newIndex++;
            }
        });
        this.refLength = newIndex - 1;
    }

    public gapLessAlignments(alignments:SequenceAlignments): void {
        this.processAlignments(alignments)
        if(this.gapLessReference.length == 0)
            return;
        alignments.target_alignments?.forEach(ta=>{
            ta?.aligned_regions?.forEach(region=>{
                if(region?.query_begin) region.query_begin = this.gapLessReference[region.query_begin];
                if(region?.query_end) region.query_end = this.gapLessReference[region.query_end];
            });
        });
        alignments.alignment_logo = alignments.alignment_logo?.filter((al,n)=>this.gapLessReference[n+1]!=-1);
        if(alignments.alignment_length) alignments.alignment_length = this.refLength;
    }

    public gapLessFeatures(annotations: Array<SequenceAnnotations>): void {
        if(this.gapLessReference.length == 0)
            return;
        annotations.forEach(ann=>{
            ann.features?.forEach(feature=>{
                feature?.feature_positions?.forEach(position=>{
                    if(position?.beg_seq_id) position.beg_seq_id = this.gapLessReference[position.beg_seq_id];
                    if(position?.end_seq_id) position.end_seq_id = this.gapLessReference[position.end_seq_id];
                });
            });
        });
    }

}

type aaType = "A"|"R"|"N"|"D"|"C"|"E"|"Q"|"G"|"H"|"I"|"L"|"K"|"M"|"F"|"P"|"S"|"T"|"W"|"Y"|"V"|"-"|"X"|"U";
