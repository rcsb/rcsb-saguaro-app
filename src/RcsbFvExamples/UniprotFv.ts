import {buildMultipleAlignmentSequenceFv} from "../RcsbFvWeb/RcsbFvBuilder";

buildMultipleAlignmentSequenceFv("pfv","select", "A0A0S2T163",{}, {
    boardConfig:{
        selectionChangeCallback:(s)=>{
            console.log(">", s)
        }
    }
}).then(()=>{
    console.log("render done");
});