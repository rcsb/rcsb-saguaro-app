import {buildEntitySummaryFv} from "../RcsbFvWeb/RcsbFvBuilder";

buildEntitySummaryFv("pfv", "select", "4Q21_1").then((module)=>{
    console.log(module)
});