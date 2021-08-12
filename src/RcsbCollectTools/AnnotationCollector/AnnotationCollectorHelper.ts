import {AnnotationTransformer} from "./AnnotationTransformer";
import {
    InterpolationTypes,
    RcsbFvColorGradient,
    RcsbFvDisplayConfigInterface,
    RcsbFvDisplayTypes,
    RcsbFvLink,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import {RcsbAnnotationConfig} from "../../RcsbAnnotationConfig/RcsbAnnotationConfig";
import {RcsbAnnotationConstants} from "../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {FeatureTools} from "../FeatureTools/FeatureTools";
import {RcsbAnnotationConfigInterface} from "../../RcsbAnnotationConfig/AnnotationConfigInterface";

export class AnnotationCollectorHelper {

    public static buildAnnotationTrack(annotationHandler: AnnotationTransformer, type: string, rcsbAnnotationConfig: RcsbAnnotationConfigInterface, provenanceList: Array<string>): RcsbFvRowConfigInterface {
        let out: RcsbFvRowConfigInterface;
        let displayType: string;
        const annConfig: RcsbAnnotationConfigInterface = rcsbAnnotationConfig;
        if (annConfig !== null) {
            displayType = annConfig.display;
        }
        if (displayType === RcsbFvDisplayTypes.COMPOSITE || displayType === RcsbFvDisplayTypes.BOND || displayType === RcsbFvDisplayTypes.PIN) {
            out = AnnotationCollectorHelper.buildRcsbFvRowConfigComposite(annotationHandler,type, rcsbAnnotationConfig);
        }else if(displayType === RcsbFvDisplayTypes.AREA || displayType === RcsbFvDisplayTypes.LINE){
            out = AnnotationCollectorHelper.buildRcsbFvRowConfigArea(annotationHandler,type, rcsbAnnotationConfig);
        }else if(displayType === RcsbFvDisplayTypes.BLOCK_AREA){
            out = AnnotationCollectorHelper.buildRcsbFvRowConfigBlockArea(annotationHandler,type, rcsbAnnotationConfig);
        }else{
            out = AnnotationCollectorHelper.buildRcsbFvRowConfigTrack(annotationHandler,type, rcsbAnnotationConfig);
        }
        if(annConfig!=null && typeof annConfig.height === "number"){
            out.trackHeight = annConfig.height;
        }
        if(
            provenanceList instanceof Array
            &&
            provenanceList.length == 1
            &&
            (provenanceList[0] === RcsbAnnotationConstants.provenanceName.pdb || provenanceList[0] === RcsbAnnotationConstants.provenanceName.promotif)
        ){
            out.titleFlagColor = RcsbAnnotationConstants.provenanceColorCode.rcsbPdb;
        }else{
            out.titleFlagColor = RcsbAnnotationConstants.provenanceColorCode.external;
        }
        return out;
    }

    private static buildRcsbFvRowConfigTrack(annotationHandler: AnnotationTransformer, type: string, rcsbAnnotationConfig: RcsbAnnotationConfigInterface):RcsbFvRowConfigInterface{
        const data: Array<RcsbFvTrackDataElementInterface> = Array.from(annotationHandler.values());
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
            rowTitle = AnnotationCollectorHelper.buildRowTitle(annConfig);
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

    private static buildRcsbFvRowConfigArea(annotationHandler: AnnotationTransformer, type: string, rcsbAnnotationConfig: RcsbAnnotationConfigInterface):RcsbFvRowConfigInterface{
        const data: Array<RcsbFvTrackDataElementInterface> = Array.from(annotationHandler.values());
        const annConfig: RcsbAnnotationConfigInterface = rcsbAnnotationConfig;
        const displayType: RcsbFvDisplayTypes = annConfig.display;
        const displayColor:string|RcsbFvColorGradient = annConfig.color;
        const rowTitle:string|RcsbFvLink = AnnotationCollectorHelper.buildRowTitle(annConfig);
        const rowPrefix:string = annConfig.prefix;

        let min: number = annotationHandler.getRange().min;
        let max: number = annotationHandler.getRange().max;

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

    private static buildRcsbFvRowConfigBlockArea(annotationHandler: AnnotationTransformer, type: string, rcsbAnnotationConfig: RcsbAnnotationConfigInterface):RcsbFvRowConfigInterface{
        const data: Array<RcsbFvTrackDataElementInterface> = Array.from(annotationHandler.values());
        const annConfig: RcsbAnnotationConfigInterface = rcsbAnnotationConfig;
        const displayType: RcsbFvDisplayTypes = annConfig.display;
        const displayColor:string|RcsbFvColorGradient = annConfig.color;
        const rowTitle:string|RcsbFvLink = AnnotationCollectorHelper.buildRowTitle(annConfig);
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

    private static buildRcsbFvRowConfigComposite(annotationHandler: AnnotationTransformer, type: string, rcsbAnnotationConfig: RcsbAnnotationConfigInterface):RcsbFvRowConfigInterface{
        const data: Array<RcsbFvTrackDataElementInterface> = Array.from(annotationHandler.values());
        let out: RcsbFvRowConfigInterface;

        const annConfig: RcsbAnnotationConfigInterface = rcsbAnnotationConfig;
        let altDisplayType = RcsbFvDisplayTypes.BLOCK;
        if(annConfig.display === RcsbFvDisplayTypes.BOND.toString()) {
            altDisplayType = RcsbFvDisplayTypes.BOND;
            data.forEach(d=>{
                d.isEmpty = true;
            });
        }
        const rowTitle = AnnotationCollectorHelper.buildRowTitle(annConfig);
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

    private static buildRowTitle(annConfig: RcsbAnnotationConfigInterface): string|RcsbFvLink {
        return annConfig.prefix ? FeatureTools.parseLink(annConfig.title) : annConfig.title
    }
}