import {buildEntitySummaryFv} from "../RcsbFvWeb/RcsbFvBuilder";

buildEntitySummaryFv("pfv", "select", "AF_AFQ8WZ42F90_1").then((module)=>{
    console.log(module)
});