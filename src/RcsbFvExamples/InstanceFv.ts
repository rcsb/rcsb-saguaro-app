import {buildInstanceFv} from "../RcsbFvWeb/RcsbFvBuilder";
import {RcsbFvDisplayTypes} from "@rcsb/rcsb-saguaro/build/RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";

buildInstanceFv("pfv", "2UZI.C").then((module)=>{
        module.getFv().then(()=>{
            module.getFv().addTrack({
                trackId: "blockTrack",
                trackHeight: 20,
                trackColor: "#F9F9F9",
                displayType: RcsbFvDisplayTypes.BLOCK,
                displayColor: "#FF0000",
                rowTitle: "MY TRACK",
                titleFlagColor: "#00FF00",
                trackData: [
                    {
                        begin: 10,
                        end: 400
                    }]
            })
        });
    });