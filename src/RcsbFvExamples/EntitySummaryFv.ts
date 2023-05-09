import {buildEntitySummaryFv} from "../RcsbFvWeb/RcsbFvBuilder";

buildEntitySummaryFv("pfv", "select", "AF_AFQ8WZ42F1_1").then((module)=>{
    console.log(module)
});