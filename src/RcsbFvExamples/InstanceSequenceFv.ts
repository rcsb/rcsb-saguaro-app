import {buildInstanceSequenceFv} from "../RcsbFvWeb/RcsbFvBuilder";

buildInstanceSequenceFv("pfv", "select", "AF_AFP69905F1").then((module)=>{
    console.log(module)
});