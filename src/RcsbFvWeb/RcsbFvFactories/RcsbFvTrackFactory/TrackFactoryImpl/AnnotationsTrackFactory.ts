import {TrackFactoryInterface} from "../TrackFactoryInterface";
import {
    InterpolationTypes,
    RcsbFvColorGradient, RcsbFvDisplayConfigInterface,
    RcsbFvDisplayTypes,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import {RcsbAnnotationConfigInterface} from "../../../../RcsbAnnotationConfig/AnnotationConfigInterface";
import {RcsbAnnotationConfig} from "../../../../RcsbAnnotationConfig/RcsbAnnotationConfig";
import {TrackManagerInterface} from "../../RcsbFvBlockFactory/AnnotationBlockManager/TrackManagerInterface";
import {TrackTitleFactoryInterface} from "../TrackTitleFactoryInterface";
import {AnnotationsTrackTitleFactory} from "../TrackTitleFactoryImpl/AnnotationsTrackTitleFactory";

export class AnnotationsTrackFactory implements TrackFactoryInterface<[TrackManagerInterface]>{

    private readonly trackTitleFactory: TrackTitleFactoryInterface<[TrackManagerInterface]>;

    constructor(trackTitleFactory?: TrackTitleFactoryInterface<[TrackManagerInterface]>) {
        this.trackTitleFactory = trackTitleFactory ?? new AnnotationsTrackTitleFactory();
    }

    async getTrack(annotations: TrackManagerInterface): Promise<RcsbFvRowConfigInterface> {
        let out: RcsbFvRowConfigInterface;
        const type: string = annotations.getId();
        const rcsbAnnotationConfig:RcsbAnnotationConfigInterface|undefined = annotations.getConfig();
        let displayType: string;
        const annConfig: RcsbAnnotationConfigInterface = rcsbAnnotationConfig;
        if (annConfig !== null) {
            displayType = annConfig.display;
        }
        switch (displayType){
            case RcsbFvDisplayTypes.COMPOSITE:
            case RcsbFvDisplayTypes.BOND:
            case RcsbFvDisplayTypes.PIN:
                out = buildRcsbFvRowConfigComposite(annotations,type, rcsbAnnotationConfig);
                break;
            case RcsbFvDisplayTypes.AREA:
            case RcsbFvDisplayTypes.LINE:
                out = buildRcsbFvRowConfigArea(annotations,type, rcsbAnnotationConfig);
                break;
            case RcsbFvDisplayTypes.BLOCK_AREA:
                out = buildRcsbFvRowConfigBlockArea(annotations,type, rcsbAnnotationConfig);
                break;
            default:
                out = buildRcsbFvRowConfigTrack(annotations,type, rcsbAnnotationConfig);
                break;
        }
        if(annConfig!=null && typeof annConfig.height === "number"){
            out.trackHeight = annConfig.height;
        }
        return {
            ...out,
            titleFlagColor: await this.trackTitleFactory.getTrackTitleFlagColor(annotations),
            rowTitle: await  this.trackTitleFactory.getTrackTitle(annotations),
            rowPrefix: await this.trackTitleFactory.getTrackTitlePrefix(annotations)
        };
    }

}

function buildRcsbFvRowConfigArea(annotationTrack: TrackManagerInterface, type: string, rcsbAnnotationConfig: RcsbAnnotationConfigInterface):RcsbFvRowConfigInterface{
    const data: RcsbFvTrackDataElementInterface[] = annotationTrack.values();
    const annConfig: RcsbAnnotationConfigInterface = rcsbAnnotationConfig;
    const displayType: RcsbFvDisplayTypes = annConfig.display;
    const displayColor:string|RcsbFvColorGradient = annConfig.color;

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
        displayDomain:domain,
        interpolationType: InterpolationTypes.STEP,
        trackData: data
    };
}

function buildRcsbFvRowConfigBlockArea(annotationTrack: TrackManagerInterface, type: string, rcsbAnnotationConfig: RcsbAnnotationConfigInterface):RcsbFvRowConfigInterface{
    const data: RcsbFvTrackDataElementInterface[] = annotationTrack.values();
    const annConfig: RcsbAnnotationConfigInterface = rcsbAnnotationConfig;
    const displayType: RcsbFvDisplayTypes = annConfig.display;
    const displayColor:string|RcsbFvColorGradient = annConfig.color;

    return {
        ...rcsbAnnotationConfig,
        trackId: "annotationTrack_" + type,
        displayType: displayType,
        trackColor: "#F9F9F9",
        displayColor: displayColor,
        displayDomain:[0,1],
        interpolationType: InterpolationTypes.STEP,
        trackData: data
    };
}

function buildRcsbFvRowConfigComposite(annotationTrack: TrackManagerInterface, type: string, rcsbAnnotationConfig: RcsbAnnotationConfigInterface):RcsbFvRowConfigInterface{
    const data: RcsbFvTrackDataElementInterface[] = annotationTrack.values();
    let out: RcsbFvRowConfigInterface;

    const annConfig: RcsbAnnotationConfigInterface = rcsbAnnotationConfig;
    let altDisplayType = RcsbFvDisplayTypes.BLOCK;
    if(annConfig.display === RcsbFvDisplayTypes.BOND.toString()) {
        altDisplayType = RcsbFvDisplayTypes.BOND;
        data.forEach(d=>{
            d.isEmpty = true;
        });
    }
    const displayColor = annConfig.color ?? RcsbAnnotationConfig.randomRgba();

    const pin: RcsbFvTrackDataElementInterface[] = new Array<RcsbFvTrackDataElementInterface>();
    const nonPin: RcsbFvTrackDataElementInterface[] = new Array<RcsbFvTrackDataElementInterface>();
    data.forEach(d => {
        if (d.end !== null && d.end !== d.begin) {
            nonPin.push(d);
        } else {
            pin.push(d);
        }
    });

    if (pin.length > 0 && nonPin.length > 0) {
        const displayConfig: RcsbFvDisplayConfigInterface[] = new Array<RcsbFvDisplayConfigInterface>();
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
            trackData: data
        };
    }
    return out;
}

function buildRcsbFvRowConfigTrack(annotationTrack: TrackManagerInterface, type: string, rcsbAnnotationConfig: RcsbAnnotationConfigInterface):RcsbFvRowConfigInterface{
    const data: RcsbFvTrackDataElementInterface[] = annotationTrack.values();
    let displayType: RcsbFvDisplayTypes = RcsbFvDisplayTypes.BLOCK;
    if (data.length > 0 && data[0].end == null) {
        displayType = RcsbFvDisplayTypes.PIN;
    }
    let displayColor: string|RcsbFvColorGradient = RcsbAnnotationConfig.randomRgba();

    const annConfig: RcsbAnnotationConfigInterface = rcsbAnnotationConfig;
    if (annConfig !== null) {
        displayType = annConfig.display;
        displayColor = annConfig.color;
    } else {
        console.warn("Annotation config type " + type + " not found. Using random config");
    }
    return {
        ...rcsbAnnotationConfig,
        trackId: "annotationTrack_" + type,
        displayType: displayType,
        trackColor: "#F9F9F9",
        displayColor: displayColor,
        trackData: data
    };
}