import {
    RcsbFvDisplayConfigInterface,
    RcsbFvRowConfigInterface
} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {
    InterpolationTypes,
    RcsbFvDisplayTypes
} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {
    RcsbFvColorGradient,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro/lib/RcsbDataManager/RcsbDataManager";
import {TrackFactoryInterface} from "../TrackFactoryInterface";
import {RcsbAnnotationConfigInterface} from "../../../../RcsbAnnotationConfig/AnnotationConfigInterface";
import {RcsbAnnotationConfig} from "../../../../RcsbAnnotationConfig/RcsbAnnotationConfig";
import {TrackManagerInterface} from "../../RcsbFvBlockFactory/BlockManager/TrackManagerInterface";
import {TrackTitleFactoryInterface} from "../TrackTitleFactoryInterface";
import {AnnotationsTrackTitleFactory} from "../TrackTitleFactoryImpl/AnnotationsTrackTitleFactory";
import {Assertions} from "../../../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;

export class AnnotationsTrackFactory implements TrackFactoryInterface<[TrackManagerInterface]>{

    private readonly trackTitleFactory: TrackTitleFactoryInterface<[TrackManagerInterface]>;

    constructor(trackTitleFactory?: TrackTitleFactoryInterface<[TrackManagerInterface]>) {
        this.trackTitleFactory = trackTitleFactory ?? new AnnotationsTrackTitleFactory();
    }

    async getTrack(annotations: TrackManagerInterface): Promise<RcsbFvRowConfigInterface> {
        let out: RcsbFvRowConfigInterface;
        const type: string = annotations.getId();
        const rcsbAnnotationConfig:RcsbAnnotationConfigInterface|undefined = annotations.getConfig();
        let displayType: string | undefined;
        const annConfig: RcsbAnnotationConfigInterface | undefined = rcsbAnnotationConfig;
        if (annConfig != null) {
            displayType = annConfig?.display;
        }
        switch (displayType){
            case RcsbFvDisplayTypes.COMPOSITE:
            case RcsbFvDisplayTypes.BOND:
            case RcsbFvDisplayTypes.PIN:
                assertDefined(rcsbAnnotationConfig)
                out = buildRcsbFvRowConfigComposite(annotations,type, rcsbAnnotationConfig);
                break;
            case RcsbFvDisplayTypes.AREA:
            case RcsbFvDisplayTypes.LINE:
                assertDefined(rcsbAnnotationConfig)
                out = buildRcsbFvRowConfigArea(annotations,type, rcsbAnnotationConfig);
                break;
            case RcsbFvDisplayTypes.BLOCK_AREA:
                assertDefined(rcsbAnnotationConfig)
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
    const data: Array<RcsbFvTrackDataElementInterface> = annotationTrack.values();
    const annConfig: RcsbAnnotationConfigInterface | undefined = rcsbAnnotationConfig;
    const displayType: RcsbFvDisplayTypes | undefined = annConfig?.display;
    const displayColor:string|RcsbFvColorGradient | undefined = annConfig?.color;

    let min: number = annotationTrack.getRange().min;
    let max: number = annotationTrack.getRange().max;

    if(min>=0)
        min=0;
    else if(Math.abs(min)>Math.abs(max))
        max = -min;
    else
        min = -max;
    const domain:[number,number] =  annConfig?.domain ?? [min,max];

    return {
        ...rcsbAnnotationConfig,
        trackId: "annotationTrack_" + type,
        displayType: displayType,
        overlap: true,
        trackColor: "#F9F9F9",
        displayColor: displayColor,
        displayDomain:domain,
        interpolationType: InterpolationTypes.STEP,
        trackData: data
    };
}

function buildRcsbFvRowConfigBlockArea(annotationTrack: TrackManagerInterface, type: string, rcsbAnnotationConfig: RcsbAnnotationConfigInterface):RcsbFvRowConfigInterface{
    const data: Array<RcsbFvTrackDataElementInterface> = annotationTrack.values();
    const annConfig: RcsbAnnotationConfigInterface = rcsbAnnotationConfig;
    const displayType: RcsbFvDisplayTypes = annConfig.display;
    const displayColor:string|RcsbFvColorGradient = annConfig.color ?? RcsbAnnotationConfig.randomRgba();

    return {
        ...rcsbAnnotationConfig,
        trackId: "annotationTrack_" + type,
        displayType: displayType,
        overlap: true,
        trackColor: "#F9F9F9",
        displayColor: displayColor,
        displayDomain:[0,1],
        interpolationType: InterpolationTypes.STEP,
        trackData: data
    };
}

function buildRcsbFvRowConfigComposite(annotationTrack: TrackManagerInterface, type: string, rcsbAnnotationConfig: RcsbAnnotationConfigInterface):RcsbFvRowConfigInterface{
    const data: Array<RcsbFvTrackDataElementInterface> = annotationTrack.values();
    let out: RcsbFvRowConfigInterface | undefined = undefined;

    const annConfig: RcsbAnnotationConfigInterface = rcsbAnnotationConfig;
    let altDisplayType = RcsbFvDisplayTypes.BLOCK;
    if(annConfig.display === RcsbFvDisplayTypes.BOND.toString()) {
        altDisplayType = RcsbFvDisplayTypes.BOND;
        data.forEach(d=>{
            d.isEmpty = true;
        });
    }
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
            displayConfig: displayConfig
        };
    } else if (pin.length > 0) {
        altDisplayType = RcsbFvDisplayTypes.PIN;
    }
    if(out == undefined){
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

function buildRcsbFvRowConfigTrack(annotationTrack: TrackManagerInterface, type: string, rcsbAnnotationConfig?: RcsbAnnotationConfigInterface):RcsbFvRowConfigInterface{
    const data: Array<RcsbFvTrackDataElementInterface> = annotationTrack.values();
    let displayType: RcsbFvDisplayTypes = RcsbFvDisplayTypes.BLOCK;
    if (data.length > 0 && data[0].end == null) {
        displayType = RcsbFvDisplayTypes.PIN;
    }
    let displayColor: string|RcsbFvColorGradient = RcsbAnnotationConfig.randomRgba();

    const annConfig: RcsbAnnotationConfigInterface | undefined = rcsbAnnotationConfig;
    if (annConfig != null) {
        displayType = annConfig.display;
        if(annConfig.color)
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