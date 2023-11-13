import {RcsbFvDisplayTypes} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {buildUniprotEntityInstanceFv} from "../RcsbFvWeb/RcsbFvBuilder";
import {
    RcsbFvTrackDataAnnotationInterface
} from "../RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/RcsbFvTrackDataAnnotationInterface";

buildUniprotEntityInstanceFv("pfv", "P01112", "2UZI_3", "2UZI.C",{boardConfig:{
        trackWidth:600,
        elementClickCallBack:(d?: RcsbFvTrackDataAnnotationInterface)=>{
            const div = document.getElementById("myDiv");
            if(!div)
                return;
            const e = d;
            if(e==null){
                div.innerHTML = "";
                return;
            }
            if(e && e.begin != undefined)
                div.innerHTML = e.begin.toString();
            else
                div.innerHTML = "";
            if(e.end != undefined)
                div.innerHTML += " - "+e.end;
            if(e.name != null)
                div.innerHTML = e.name+" : "+div.innerHTML
            else if(e.type != null)
                div.innerHTML = e.type+" : "+div.innerHTML

        }
    }}).then((module)=>{
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