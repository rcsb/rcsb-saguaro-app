import {buildSequenceIdentityAlignmentFv} from "../RcsbFvWeb/RcsbFvBuilder";

buildSequenceIdentityAlignmentFv("pfv", "5_30", undefined, {boardConfig:{
    selectionChangeCallBack:(selection)=>{
        console.log(selection);
    }
    },
    beforeChangeCallback:(module)=>{
        console.log("This happens before change")
    },
    onChangeCallback:()=>{
        console.log("This happens after change")
    }
}).then(pfv=>{
    console.log(pfv, "rendered");
});