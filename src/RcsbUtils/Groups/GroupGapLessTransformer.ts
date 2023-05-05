import {AlignmentResponse} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {Logo} from "../TrackGenerators/Logo";
import {Assertions} from "../Helpers/Assertions";
import assertElementListDefined = Assertions.assertElementListDefined;
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";

export class GroupGapLessTransformer {

    private readonly gapLessReference: number[] = [];
    private refLength: number;
    public processAlignments(alignment: AlignmentResponse): void {
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

    public gapLessRow(row: RcsbFvRowConfigInterface): void {
        if(row.trackData){
            row.trackData.forEach(td=>{
                td.begin = this.gapLessReference[td.begin];
                if(td.end) td.end = this.gapLessReference[td.end];
            })
        }else if (row.displayConfig){
            row.displayConfig.forEach(dc=>{
                dc.displayData?.forEach(td=>{
                    td.begin = this.gapLessReference[td.begin];
                    if(td.end) td.end = this.gapLessReference[td.end];
                })
            })
        }
    }

    public gapLessLength(): number {
        return this.refLength;
    }

}

type aaType = "A"|"R"|"N"|"D"|"C"|"E"|"Q"|"G"|"H"|"I"|"L"|"K"|"M"|"F"|"P"|"S"|"T"|"W"|"Y"|"V"|"-"|"X"|"U";
