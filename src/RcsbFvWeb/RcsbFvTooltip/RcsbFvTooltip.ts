import {RcsbFvTooltipInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvTooltip/RcsbFvTooltipInterface";
import {
    RcsbFvTrackDataAnnotationInterface
} from "../RcsbFvFactories/RcsbFvTrackFactory/RcsbFvTrackDataAnnotationInterface";

export class RcsbFvTooltip implements RcsbFvTooltipInterface {
    showTooltip(d: RcsbFvTrackDataAnnotationInterface): HTMLElement {
        const tooltipDiv = document.createElement<"div">("div");

        let region: string = "Position: "+d.begin.toString();
        if(typeof d.end === "number" && d.end!=d.begin) region += " - "+d.end.toString();
        const spanRegion: HTMLSpanElement = document.createElement<"span">("span");
        spanRegion.append(region);

        if(typeof d.beginName === "string" && d.indexName != undefined){
            spanRegion.append(RcsbFvTooltip.buildIndexNames(d.beginName,d.endName,d.indexName));
        }

        if(typeof d.oriBegin === "number"){
            let ori_region: string = d.oriBegin.toString();
            if(typeof d.oriEnd === "number") ori_region += " - "+d.oriEnd.toString();
            const spanOriRegion: HTMLSpanElement = document.createElement<"span">("span");
            if(d.source != undefined)
                spanOriRegion.append(" | ["+d.source.replace("_"," ")+"] "+d.sourceId+": "+ori_region);
            spanOriRegion.style.color = "#888888";
            if( typeof d.oriBeginName === "string" && d.indexName!= undefined)
                spanOriRegion.append(RcsbFvTooltip.buildIndexNames(d.oriBeginName,d.oriEndName,d.indexName));
            spanRegion.append(spanOriRegion);
        }

        let title:string | undefined = d.title;
        if(typeof d.name === "string") title = d.name;
        else if( typeof d.featureId === "string") title = d.featureId;
        if(title != undefined )tooltipDiv.append(title);
        if(typeof d.provenanceName === "string"){
            const spanProvenance: HTMLSpanElement = document.createElement<"span">("span");

            const spanProvenanceString: HTMLSpanElement = document.createElement<"span">("span");
            spanProvenanceString.append(d.provenanceName);
            if(typeof d.provenanceColor === "string")
                spanProvenanceString.style.color = d.provenanceColor;
            else
                spanProvenanceString.style.color = "#888888";
            spanProvenance.append(" [",spanProvenanceString,"]");
            spanProvenance.style.color = "#888888";
            tooltipDiv.append(spanProvenance);
            tooltipDiv.append(RcsbFvTooltip.bNode());
        }else if(title!=undefined){
            tooltipDiv.append(RcsbFvTooltip.bNode());
        }
        if(typeof d.value === "number"){
            const valueRegion: HTMLSpanElement = document.createElement<"span">("span");
            valueRegion.append(" value: "+d.value);
            tooltipDiv.append(valueRegion);
            tooltipDiv.append(RcsbFvTooltip.bNode());
        }
        tooltipDiv.append(spanRegion);
        return tooltipDiv;
    }

    showTooltipDescription(d: RcsbFvTrackDataAnnotationInterface): HTMLElement | undefined {
        if(d.description == null || d.description.length == 0)
            return undefined;
        const tooltipDescriptionDiv = document.createElement<"div">("div");
        d.description.forEach(des=>{
            const desDiv = document.createElement<"div">("div");
            desDiv.append(des);
            tooltipDescriptionDiv.append(desDiv);
        });
        return tooltipDescriptionDiv;
    }

    private static buildIndexNames(beginName:string, endName:string|undefined, name: string): HTMLSpanElement{
        const spanAuthRegion: HTMLSpanElement = document.createElement<"span">("span");
        let authRegion: string = beginName;
        if(typeof endName === "string") authRegion += " - "+endName;
        spanAuthRegion.append( " ["+name+": "+authRegion+"]" );
        spanAuthRegion.style.color = "#888888";
        return spanAuthRegion;
    }

    private static bNode(): HTMLSpanElement{
        const b:HTMLSpanElement = document.createElement<"span">("span");
        b.append(" | ");
        b.style.fontWeight = "bold";
        return b;
    }

}