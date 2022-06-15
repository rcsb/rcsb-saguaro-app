import {buildInstanceSequenceFv} from "../RcsbFvWeb/RcsbFvBuilder";

buildInstanceSequenceFv("pfv", "select", "MA_MABAKCEPC0005", {module:"interface"}).then((module)=>{
    console.log(module);
});