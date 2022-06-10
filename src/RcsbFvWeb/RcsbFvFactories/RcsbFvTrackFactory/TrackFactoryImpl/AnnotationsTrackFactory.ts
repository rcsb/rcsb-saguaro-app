import {TrackFactoryInterface} from "../TrackFactoryInterface";
import {
    InterpolationTypes,
    RcsbFvColorGradient, RcsbFvDisplayConfigInterface,
    RcsbFvDisplayTypes, RcsbFvLink,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import {RcsbAnnotationConfigInterface} from "../../../../RcsbAnnotationConfig/AnnotationConfigInterface";
import {RcsbAnnotationConstants} from "../../../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {RcsbAnnotationConfig} from "../../../../RcsbAnnotationConfig/RcsbAnnotationConfig";
import {FeatureTools} from "../../../../RcsbCollectTools/FeatureTools/FeatureTools";
import {TrackManagerInterface} from "../../RcsbFvBlockFactory/BlockManager/TrackManagerInterface";

export class AnnotationsTrackFactory implements TrackFactoryInterface<[TrackManagerInterface]>{

    async getTrack(annotations: TrackManagerInterface): Promise<RcsbFvRowConfigInterface> {
        let out: RcsbFvRowConfigInterface;
        const type: string = annotations.getId();
        const rcsbAnnotationConfig:RcsbAnnotationConfigInterface|undefined = annotations.getConfig();
        let displayType: string;
        const annConfig: RcsbAnnotationConfigInterface = rcsbAnnotationConfig;
        if (annConfig !== null) {
            displayType = annConfig.display;
        }
        if (displayType === RcsbFvDisplayTypes.COMPOSITE || displayType === RcsbFvDisplayTypes.BOND || displayType === RcsbFvDisplayTypes.PIN) {
            out = buildRcsbFvRowConfigComposite(annotations,type, rcsbAnnotationConfig);
        }else if(displayType === RcsbFvDisplayTypes.AREA || displayType === RcsbFvDisplayTypes.LINE){
            out = buildRcsbFvRowConfigArea(annotations,type, rcsbAnnotationConfig);
        }else if(displayType === RcsbFvDisplayTypes.BLOCK_AREA){
            out = buildRcsbFvRowConfigBlockArea(annotations,type, rcsbAnnotationConfig);
        }else{
            out = buildRcsbFvRowConfigTrack(annotations,type, rcsbAnnotationConfig);
        }
        if(annConfig!=null && typeof annConfig.height === "number"){
            out.trackHeight = annConfig.height;
        }
        const provenance: string[] = Array.from(rcsbAnnotationConfig?.provenanceList ?? []);
        if(
            Array.isArray(provenance)
            &&
            provenance.length == 1
            &&
            (provenance[0] === RcsbAnnotationConstants.provenanceName.pdb || provenance[0] === RcsbAnnotationConstants.provenanceName.promotif)
        ){
            out.titleFlagColor = RcsbAnnotationConstants.provenanceColorCode.rcsbPdb;
        }else{
            out.titleFlagColor = RcsbAnnotationConstants.provenanceColorCode.external;
        }
        return out;
    }

}

function buildRcsbFvRowConfigArea(annotationTrack: TrackManagerInterface, type: string, rcsbAnnotationConfig: RcsbAnnotationConfigInterface):RcsbFvRowConfigInterface{
    const data: Array<RcsbFvTrackDataElementInterface> = annotationTrack.values();
    const annConfig: RcsbAnnotationConfigInterface = rcsbAnnotationConfig;
    const displayType: RcsbFvDisplayTypes = annConfig.display;
    const displayColor:string|RcsbFvColorGradient = annConfig.color;
    const rowTitle:string|RcsbFvLink = buildRowTitle(annConfig);
    const rowPrefix:string = annConfig.prefix;

    let min: number = annotationTrack.getRange().min;
    let max: number = annotationTrack.getRange().max;

    if(min>=0)
        min=0;
    else if(Math.abs(min)>Math.abs(max))
        max = -min;
    else
        min = -max;
    const domain:[number,number] =  annConfig.domain ?? [min,max];

    return {
        ...rcsbAnnotationConfig,
        trackId: "annotationTrack_" + type,
        displayType: displayType,
        trackColor: "#F9F9F9",
        displayColor: displayColor,
        rowTitle: rowTitle,
        rowPrefix: rowPrefix,
        displayDomain:domain,
        interpolationType: InterpolationTypes.STEP,
        trackData: data
    };
}

function buildRcsbFvRowConfigBlockArea(annotationTrack: TrackManagerInterface, type: string, rcsbAnnotationConfig: RcsbAnnotationConfigInterface):RcsbFvRowConfigInterface{
    const data: Array<RcsbFvTrackDataElementInterface> = annotationTrack.values();
    const annConfig: RcsbAnnotationConfigInterface = rcsbAnnotationConfig;
    const displayType: RcsbFvDisplayTypes = annConfig.display;
    const displayColor:string|RcsbFvColorGradient = annConfig.color;
    const rowTitle:string|RcsbFvLink = buildRowTitle(annConfig);
    const rowPrefix:string = annConfig.prefix;

    return {
        ...rcsbAnnotationConfig,
        trackId: "annotationTrack_" + type,
        displayType: displayType,
        trackColor: "#F9F9F9",
        displayColor: displayColor,
        rowTitle: rowTitle,
        rowPrefix: rowPrefix,
        displayDomain:[0,1],
        interpolationType: InterpolationTypes.STEP,
        trackData: data
    };
}

function buildRcsbFvRowConfigComposite(annotationTrack: TrackManagerInterface, type: string, rcsbAnnotationConfig: RcsbAnnotationConfigInterface):RcsbFvRowConfigInterface{
    const data: Array<RcsbFvTrackDataElementInterface> = annotationTrack.values();
    let out: RcsbFvRowConfigInterface;

    const annConfig: RcsbAnnotationConfigInterface = rcsbAnnotationConfig;
    let altDisplayType = RcsbFvDisplayTypes.BLOCK;
    if(annConfig.display === RcsbFvDisplayTypes.BOND.toString()) {
        altDisplayType = RcsbFvDisplayTypes.BOND;
        data.forEach(d=>{
            d.isEmpty = true;
        });
    }
    const rowTitle = buildRowTitle(annConfig);
    const rowPrefix = annConfig.prefix;
    const displayColor = annConfig.color ?? RcsbAnnotationConfig.randomRgba();

    const pin: Array<RcsbFvTrackDataElementInterface> = new Array<RcsbFvTrackDataElementInterface>();
    const nonPin: Array<RcsbFvTrackDataElementInterface> = new Array<RcsbFvTrackDataElementInterface>();
    data.forEach(d => {
        if (d.end !== null && d.end !== d.begin) {
            nonPin.push(d);
        } else {
            pin.push(d);
        }
    });

    if (pin.length > 0 && nonPin.length > 0) {
        const displayConfig: Array<RcsbFvDisplayConfigInterface> = new Array<RcsbFvDisplayConfigInterface>();
        displayConfig.push({
            displayData: nonPin,
            displayType: altDisplayType,
            displayColor: displayColor
        } as RcsbFvDisplayConfigInterface);
        displayConfig.push({
            displayData: pin,
            displayType: RcsbFvDisplayTypes.PIN,
            displayColor: displayColor
        } as RcsbFvDisplayConfigInterface);
        out = {
            displayType: RcsbFvDisplayTypes.COMPOSITE,
            trackColor: "#F9F9F9",
            trackId: "annotationTrack_" + type,
            rowTitle: rowTitle,
            rowPrefix: rowPrefix,
            displayConfig: displayConfig
        };
    } else if (pin.length > 0) {
        altDisplayType = RcsbFvDisplayTypes.PIN;
    }
    if(out === undefined){
        out = {
            trackId: "annotationTrack_" + type,
            displayType: altDisplayType,
            trackColor: "#F9F9F9",
            displayColor: displayColor,
            rowTitle: rowTitle,
            rowPrefix: rowPrefix,
            trackData: data
        };
    }
    return out;
}

function buildRcsbFvRowConfigTrack(annotationTrack: TrackManagerInterface, type: string, rcsbAnnotationConfig: RcsbAnnotationConfigInterface):RcsbFvRowConfigInterface{
    const data: Array<RcsbFvTrackDataElementInterface> = annotationTrack.values();
    let displayType: RcsbFvDisplayTypes = RcsbFvDisplayTypes.BLOCK;
    if (data.length > 0 && data[0].end == null) {
        displayType = RcsbFvDisplayTypes.PIN;
    }
    let displayColor: string|RcsbFvColorGradient = RcsbAnnotationConfig.randomRgba();
    let rowTitle: RcsbFvLink | string = type;
    let rowPrefix: string|undefined = undefined;

    const annConfig: RcsbAnnotationConfigInterface = rcsbAnnotationConfig;
    if (annConfig !== null) {
        displayType = annConfig.display;
        rowTitle = buildRowTitle(annConfig);
        displayColor = annConfig.color;
        rowPrefix = annConfig.prefix
    } else {
        console.warn("Annotation config type " + type + " not found. Using random config");
    }
    return {
        ...rcsbAnnotationConfig,
        trackId: "annotationTrack_" + type,
        displayType: displayType,
        trackColor: "#F9F9F9",
        displayColor: displayColor,
        rowTitle: rowTitle,
        rowPrefix: rowPrefix,
        trackData: data
    };
}

function buildRowTitle(annConfig: RcsbAnnotationConfigInterface): string|RcsbFvLink {
    return annConfig.prefix ? FeatureTools.parseLink(annConfig.title) : annConfig.title
}