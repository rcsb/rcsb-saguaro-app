import {
    InterpolationTypes,
    RcsbFvColorGradient,
    RcsbFvDisplayConfigInterface,
    RcsbFvDisplayTypes,
    RcsbFvLink,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from '@rcsb/rcsb-saguaro';

import {AnnotationTransformer} from "./AnnotationTransformer";
import {RcsbAnnotationConfig, RcsbAnnotationConfigInterface} from "../../../RcsbAnnotationConfig/RcsbAnnotationConfig";
import {ParseLink} from "../ParseLink";

export class RcsbFvRowBuilder {

    public static buildRcsbFvRowConfigTrack(annotationHandler: AnnotationTransformer, type: string, trackConfig:RcsbAnnotationConfigInterface):RcsbFvRowConfigInterface{
        const data: Array<RcsbFvTrackDataElementInterface> = Array.from(annotationHandler.values());
        let displayType: RcsbFvDisplayTypes = RcsbFvDisplayTypes.BLOCK;
        if (data.length > 0 && data[0].end == null) {
            displayType = RcsbFvDisplayTypes.PIN;
        }
        let displayColor: string|RcsbFvColorGradient = RcsbAnnotationConfig.randomRgba();
        let rowTitle: RcsbFvLink | string = type;
        let rowPrefix: string|undefined = undefined;

        const annConfig: RcsbAnnotationConfigInterface = trackConfig;
        if (annConfig !== null) {
            displayType = annConfig.display;
            rowTitle = RcsbFvRowBuilder.buildRowTitle(annConfig);
            displayColor = annConfig.color;
            rowPrefix = annConfig.prefix
        } else {
            console.warn("Annotation config type " + type + " not found. Using random config");
        }
        return {
            trackId: "annotationTrack_" + type,
            displayType: displayType,
            trackColor: "#F9F9F9",
            displayColor: displayColor,
            rowTitle: rowTitle,
            rowPrefix: rowPrefix,
            trackData: data
        };
    }

    public static buildRcsbFvRowConfigArea(annotationHandler: AnnotationTransformer, type: string, trackConfig:RcsbAnnotationConfigInterface):RcsbFvRowConfigInterface{
        const data: Array<RcsbFvTrackDataElementInterface> = Array.from(annotationHandler.values());
        const annConfig: RcsbAnnotationConfigInterface = trackConfig;

        const displayType: RcsbFvDisplayTypes = annConfig.display;
        const displayColor:string|RcsbFvColorGradient = annConfig.color ?? RcsbAnnotationConfig.randomRgba();
        const rowTitle:string = annConfig.title;
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

    public static buildRcsbFvRowConfigComposite(annotationHandler: AnnotationTransformer, type: string, trackConfig:RcsbAnnotationConfigInterface):RcsbFvRowConfigInterface{
        const data: Array<RcsbFvTrackDataElementInterface> = Array.from(annotationHandler.values());
        let out: RcsbFvRowConfigInterface;

        const annConfig: RcsbAnnotationConfigInterface = trackConfig;
        let altDisplayType = RcsbFvDisplayTypes.BLOCK;
        if(annConfig.display === RcsbFvDisplayTypes.BOND.toString()) {
            altDisplayType = RcsbFvDisplayTypes.BOND;
            data.forEach(d=>{
                d.isEmpty = true;
            });
        }
        const rowTitle = RcsbFvRowBuilder.buildRowTitle(annConfig);
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
        return annConfig.prefix ? ParseLink.build(annConfig.title) : annConfig.title
    }


}