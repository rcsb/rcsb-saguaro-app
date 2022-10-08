import {buildSequenceIdentityAlignmentFv} from "../RcsbFvWeb/RcsbFvBuilder";

buildSequenceIdentityAlignmentFv("pfv", "5_30", undefined, {boardConfig:{
    selectionChangeCallBack:(selection)=>{
        console.log(selection);
    }
    }}).then(pfv=>{
    console.log(pfv, "rendered");
});