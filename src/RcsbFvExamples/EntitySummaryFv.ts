import {buildEntitySummaryFv} from "../RcsbFvWeb/RcsbFvBuilder";
import {getJsonFromUrl, onLoad} from "./utils/events";

onLoad(()=>{
    const args: {entityId:string} = getJsonFromUrl().entityId ? getJsonFromUrl() : {entityId:"3HBX_1"};
    buildEntitySummaryFv("pfv", "select", args.entityId).then((module)=>{
        console.log(module)
    });
});
