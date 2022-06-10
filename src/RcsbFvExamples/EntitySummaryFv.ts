import {buildEntitySummaryFv} from "../RcsbFvWeb/RcsbFvBuilder";

buildEntitySummaryFv("pfv", "select", "AF_AFP69905F1_1").then((module)=>{
    console.log(module)
});