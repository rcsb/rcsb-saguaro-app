import {buildMultipleAlignmentSequenceFv} from "../RcsbFvWeb/RcsbFvBuilder";

buildMultipleAlignmentSequenceFv("pfv","select", "P01112",{}, {
    boardConfig:{
        selectionChangeCallBack:(s)=>{
            console.log(">", s)
        }
    }
}).then(()=>{
    console.log("render done");
});