import {buildSequenceIdentityAlignmentFv} from "../RcsbFvWeb/RcsbFvBuilder";

buildSequenceIdentityAlignmentFv("pfv", "5_30").then(pfv=>{
    console.log(pfv, "rendered");
});